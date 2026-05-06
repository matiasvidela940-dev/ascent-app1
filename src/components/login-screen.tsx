'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mountain, Loader2, ArrowRight } from 'lucide-react'

export function LoginScreen() {
  const [identifier, setIdentifier] = useState('')
  const { login, isLoading, authError } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return
    await login(identifier.trim())
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 fade-in">
          <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center">
            <Mountain className="w-8 h-8 text-cyan" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              ASCENT
            </h1>
            <p className="text-xs tracking-[0.3em] text-muted-foreground font-medium mt-0.5">
              RUN CLUB
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email o código de acceso
            </label>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="tu@email.com o ASCENT01"
              className="h-12 text-base bg-muted/50 border-0 focus-visible:ring-cyan/30 placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={!identifier.trim() || isLoading}
            className="w-full h-12 text-base font-semibold bg-cyan hover:bg-cyan/90 text-white rounded-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ingresando a tu planificación…
              </>
            ) : (
              <>
                Ingresar
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {authError && (
            <p className="text-sm text-destructive text-center fade-in">
              {authError}
            </p>
          )}
        </form>

        {/* Footer hints */}
        <div className="space-y-3 text-center fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs text-muted-foreground/60">
            Ingresá con tu email o código de acceso<br />
            proporcionado por tu entrenador
          </p>
          <div className="border-t border-border/50 pt-3">
            <p className="text-[10px] text-muted-foreground/40 tracking-wider font-medium">
              ENTRENADORES: Ingresen con el código ENTRENADOR
            </p>
          </div>
        </div>
      </div>

      {/* Brand phrase */}
      <div className="mt-auto pb-8 pt-12">
        <p className="text-xs tracking-widest text-muted-foreground/40 font-medium">
          PROCESO &gt; RESULTADO
        </p>
      </div>
    </div>
  )
}
