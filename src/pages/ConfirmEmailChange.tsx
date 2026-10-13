import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { logout } = useAuth()

  const [isProcessing, setIsProcessing] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsProcessing(false)
      setErrorMessage('Token de alteração de e-mail não encontrado.')
      return
    }

    pb.collection('users')
      .confirmEmailChange(token, '')
      .then(() => {
        setIsSuccess(true)
        // Specification requirement: afterwards user is signed out and must log in again
        logout()
      })
      .catch((err) => {
        console.warn('Erro ao confirmar alteração de e-mail:', err)
        setErrorMessage(
          err?.response?.message ||
            err?.message ||
            'Não foi possível atualizar seu e-mail. O link pode ter expirado.',
        )
      })
      .finally(() => {
        setIsProcessing(false)
      })
  }, [token, logout])

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-[440px] bg-[#111936] rounded-3xl border border-slate-700/80 p-8 shadow-2xl relative text-center">
        {isProcessing ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">Confirmando novo e-mail...</h3>
          </div>
        ) : isSuccess ? (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">E-mail alterado com sucesso!</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Seu e-mail foi atualizado. Por segurança, sua sessão foi finalizada. Faça login
              novamente usando seu novo endereço.
            </p>
            <Link to="/auth">
              <Button className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold py-5">
                Entrar com novo e-mail
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Falha na alteração</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {errorMessage || 'Não foi possível confirmar o novo e-mail.'}
            </p>
            <Link to="/auth">
              <Button variant="outline" className="w-full border-slate-700 text-slate-200">
                Voltar para o login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
