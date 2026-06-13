'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + redirectTo },
        })
        if (error) throw error
        alert('Conta criada! Verifique seu email para confirmar.')
        setIsRegister(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <Link href="/" className="text-2xl">
          🍎
        </Link>
        <CardTitle className="text-xl mt-2">
          {isRegister ? 'Criar Conta' : 'Entrar'}
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          {isRegister
            ? 'Crie sua conta para gerenciar ofertas'
            : 'Acesse o painel do dono'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="mín. 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading
              ? 'Aguarde...'
              : isRegister
                ? '📝 Criar Conta'
                : '🚀 Entrar'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          {isRegister ? (
            <>
              Já tem conta?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-red-600 underline"
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              Novo por aqui?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-red-600 underline"
              >
                Criar conta
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="text-slate-500">Carregando...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
