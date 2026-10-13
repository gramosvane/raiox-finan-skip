import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setErrorMessage('Token de verificação não informado.')
      return
    }

    pb.collection('users')
      .confirmVerification(token)
      .then(() => {
        setIsSuccess(true)
      })
      .catch((err) => {
        console.warn('Erro ao verificar e-mail:', err)
        setErrorMessage(
          err?.response?.message ||
            err?.message ||
            'Não foi possível verificar a conta. O link pode ser inválido ou já utilizado.',
        )
      })
      .finally(() => {
        setIsVerifying(false)
      })
  }, [token])

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-[440px] bg-[#111936] rounded-3xl border border-slate-700/80 p-8 shadow-2xl relative text-center">
        {isVerifying ? (
          <div className="space-y-4 py-8">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">Validando seu e-mail...</h3>
            <p className="text-xs text-slate-400">Por favor, aguarde alguns instantes.</p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">E-mail verificado com sucesso!</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sua conta agora está totalmente verificada e ativa. Você já pode fazer login e acessar
              todos os recursos.
            </p>
            <Link to="/auth">
              <Button className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold py-5">
                Fazer login
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Falha na verificação</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {errorMessage || 'Não foi possível confirmar seu e-mail.'}
            </p>
            <Link to="/auth">
              <Button variant="outline" className="w-full border-slate-700 text-slate-200">
                Voltar para o início
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
