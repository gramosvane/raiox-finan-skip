import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!token) {
      setErrorMessage('Token de redefinição não encontrado ou expirado.')
      return
    }

    if (!password || password.length < 8) {
      setErrorMessage('A nova senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('As senhas informadas não coincidem.')
      return
    }

    setIsSubmitting(true)
    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setIsSuccess(true)
      toast({
        title: 'Senha redefinida com sucesso!',
        description: 'Faça login com sua nova senha.',
      })
      setTimeout(() => {
        navigate('/auth', { replace: true })
      }, 2000)
    } catch (err: any) {
      console.warn('Erro ao redefinir senha:', err)
      setErrorMessage(
        err?.response?.message ||
          err?.message ||
          'Não foi possível redefinir a senha. O link pode ter expirado.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-[440px] bg-[#111936] rounded-3xl border border-slate-700/80 p-8 shadow-2xl relative text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Redefinir Senha</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Escolha uma nova senha forte com no mínimo 8 caracteres.
        </p>

        {isSuccess ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 text-xs sm:text-sm flex items-center gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
              <span>Senha redefinida. Faça login com sua nova senha. Redirecionando...</span>
            </div>
            <Link to="/auth">
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold">
                Ir para o login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!token && (
              <div className="p-3 rounded-lg bg-amber-950/70 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Nenhum token encontrado na URL. Verifique o link recebido no e-mail.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Nova senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold py-5 mt-2"
            >
              {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
