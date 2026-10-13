import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Target redirect destination
  const from = (location.state as { from?: string })?.from || '/meus-resultados'
  const initialMode = (location.state as { mode?: 'login' | 'register' })?.mode || 'login'

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('')

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})

    const errors: Record<string, string> = {}
    if (!loginEmail.trim()) {
      errors.email = 'O campo e-mail é obrigatório.'
    }
    if (!loginPassword) {
      errors.password = 'A senha é obrigatória.'
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      const record = await login(loginEmail, loginPassword)
      toast({
        title: `Bem-vindo(a) de volta, ${record.name || 'usuário(a)'}!`,
        description: 'Login realizado com sucesso.',
      })
      navigate(from, { replace: true })
    } catch (err: any) {
      console.warn('Erro de login:', err)
      const message =
        err?.response?.message ||
        err?.message ||
        'Falha ao autenticar. Verifique seu e-mail e senha.'
      setGeneralError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)
    setFieldErrors({})
    setVerificationNotice(null)

    const errors: Record<string, string> = {}
    if (!registerName.trim()) {
      errors.name = 'O nome completo é obrigatório.'
    }
    if (!registerEmail.trim()) {
      errors.email = 'O e-mail é obrigatório.'
    }
    if (!registerPassword) {
      errors.password = 'A senha é obrigatória.'
    } else if (registerPassword.length < 8) {
      errors.password = 'A senha deve ter pelo menos 8 caracteres.'
    }
    if (registerPassword !== registerPasswordConfirm) {
      errors.passwordConfirm = 'As senhas informadas não coincidem.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    try {
      await register(registerName, registerEmail, registerPassword)
      setVerificationNotice(
        'Enviamos um link de verificação para seu e-mail. Clique nele para ativar sua conta.',
      )
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Sua conta foi criada e está conectada.',
      })
      // Delay briefly then redirect to intended location
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 1500)
    } catch (err: any) {
      console.warn('Erro de cadastro:', err)
      if (err?.data?.data) {
        // PocketBase field-level errors
        const pbErrors: Record<string, string> = {}
        Object.entries(err.data.data).forEach(([key, val]: [string, any]) => {
          pbErrors[key] = val?.message || 'Valor inválido.'
        })
        setFieldErrors(pbErrors)
      } else {
        const message =
          err?.response?.message ||
          err?.message ||
          'Não foi possível criar sua conta. Tente novamente.'
        setGeneralError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-[460px] bg-[#111936] rounded-3xl border border-slate-700/80 p-8 shadow-2xl relative">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-teal-500/15 blur-2xl pointer-events-none" />

        {/* Top header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#14B8A6] to-[#0EA5E9] p-[1.5px]">
              <div className="w-full h-full bg-[#0B1020] rounded-full flex items-center justify-center text-teal-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              Raio-X <span className="text-teal-400 font-light">Financeiro</span>
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {activeTab === 'login' ? 'Acesse sua conta' : 'Crie sua conta grátis'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {activeTab === 'login'
              ? 'Acompanhe seu histórico de diagnósticos e evolução.'
              : 'Salve seus relatórios e veja seu progresso ao longo do tempo.'}
          </p>
        </div>

        {/* Two-mode toggle tab */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setGeneralError(null)
              setFieldErrors({})
            }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register')
              setGeneralError(null)
              setFieldErrors({})
            }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* General error banner */}
        {generalError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Verification notice */}
        {verificationNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-teal-950/70 border border-teal-800/80 text-teal-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
            <span>{verificationNotice}</span>
          </div>
        )}

        {/* Mode: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">E-mail</Label>
              <div className="relative">
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400 font-medium mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-300 font-medium">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-400 font-medium mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold py-5 mt-2"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
              >
                Ainda não tem conta? <strong className="text-teal-400">Cadastre-se</strong>
              </button>
            </div>
          </form>
        )}

        {/* Mode: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Nome completo</Label>
              <div className="relative">
                <Input
                  type="text"
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-red-400 font-medium mt-1">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">E-mail</Label>
              <div className="relative">
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400 font-medium mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10 pr-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Mínimo de 8 caracteres</p>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-400 font-medium mt-0.5">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300 font-medium">Confirmar senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={registerPasswordConfirm}
                  onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                  className="bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {fieldErrors.passwordConfirm && (
                <p className="text-[11px] text-red-400 font-medium mt-1">
                  {fieldErrors.passwordConfirm}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold py-5 mt-2"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
              >
                Já possui uma conta? <strong className="text-teal-400">Fazer login</strong>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
