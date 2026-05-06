import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Server-side Supabase client with service_role key (bypasses RLS)
// This is safe for server-side use only — the key is never exposed to the client
// Falls back to anon key if service_role key is not configured
function createServerClient(): SupabaseClient {
  if (supabaseServiceKey) {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
  // Fallback to anon key (will be limited by RLS)
  console.warn('[Supabase] SUPABASE_SERVICE_ROLE_KEY not set. Using anon key. RLS may block operations.')
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Singleton server client for API routes
export const supabase = createServerClient()

// Check if we're using the service_role key (for diagnostics)
export const isUsingServiceRole = !!supabaseServiceKey
