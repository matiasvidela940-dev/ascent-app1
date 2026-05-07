import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Lazy singleton — avoids evaluating createClient() at module-import time
// which can cause issues with Turbopack's eager compilation
let _supabase: SupabaseClient | null = null

function getServerClient(): SupabaseClient {
  if (_supabase) return _supabase

  if (supabaseServiceKey) {
    _supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  } else {
    console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY not set. Using anon key. RLS may block operations.')
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return _supabase
}

// Export as getter so it's lazily initialized on first use
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getServerClient(), prop)
  },
})

// Check if we're using the service_role key (for diagnostics)
export const isUsingServiceRole = !!supabaseServiceKey
