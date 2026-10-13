import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.')
      return
    }

    setIsSubmitting(true)
    try {
      await pb.collection('users').requestPasswordReset(email.trim())
      setIsSuccess(true)
    } catch (err: any) {
      console.warn('Erro ao solicitar recuperação de senha:', err)
      // Even if user not found, don't leak account existence — show success or friendly message
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-[440px] bg-[#111936] rounded-3xl border border-slate-700/80 p-8 shadow-2xl relative text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Esqueceu sua senha?</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Informe seu e-mail cadastrado para enviarmos instruções de recuperação.
        </p>

        {isSuccess ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 text-xs sm:text-sm leading-relaxed flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <span>Se existir uma conta com este e-mail, enviaremos um link de redefinição.</span>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="w-full border-slate-700 text-slate-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o login
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

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">E-mail cadastrado</Label>
              <div className="relative">
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold py-5 mt-2"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar link de redefinição'}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/auth"
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Lembrou sua senha? Voltar para Entrar
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
