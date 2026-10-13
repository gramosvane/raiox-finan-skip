import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { diagnosticsService } from '@/services/diagnostics'
import { useRealtime } from '@/hooks/use-realtime'
import { getScoreTier } from '@/lib/scoring'
import type { DiagnosticRecord } from '@/types/diagnostic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  FileText,
  Sparkles,
  Trophy,
  History,
  TrendingUp,
  ChevronDown,
  Trash2,
  AlertCircle,
  PlusCircle,
  Settings,
  Mail,
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  X,
} from 'lucide-react'

export default function MeusResultados() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [diagnostics, setDiagnostics] = useState<DiagnosticRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Email change dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false)
  const [emailChangeNotice, setEmailChangeNotice] = useState<string | null>(null)
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null)

  // Auth guard: redirect to /auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { state: { from: '/meus-resultados' }, replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  const fetchDiagnostics = async () => {
    try {
      const data = await diagnosticsService.listUserDiagnostics()
      setDiagnostics(data)
    } catch (err) {
      console.warn('Erro ao carregar diagnósticos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDiagnostics()
    }
  }, [isAuthenticated])

  // Real-time subscription to `diagnostics` collection
  useRealtime<any>(
    'diagnostics',
    (e) => {
      if (e.action === 'create' || e.action === 'update' || e.action === 'delete') {
        fetchDiagnostics()
      }
    },
    isAuthenticated,
  )

  // Computed summary metrics
  const stats = useMemo(() => {
    const count = diagnostics.length
    if (count === 0) {
      return { count: 0, latest: 0, best: 0 }
    }
    const latest = diagnostics[0]?.total_score || 0
    const best = Math.max(...diagnostics.map((d) => d.total_score))
    return { count, latest, best }
  }, [diagnostics])

  const handleDelete = async (id: string) => {
    try {
      await diagnosticsService.deleteDiagnostic(id)
      setDiagnostics((prev) => prev.filter((d) => d.id !== id))
      setDeletingId(null)
      toast({
        title: 'Diagnóstico excluído',
        description: 'O registro foi removido com sucesso.',
      })
    } catch (err: any) {
      console.warn('Erro ao excluir:', err)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o registro.',
        variant: 'destructive',
      })
    }
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailChangeNotice(null)
    setEmailChangeError(null)

    if (!newEmail.trim() || newEmail === user?.email) {
      setEmailChangeError('Informe um endereço de e-mail novo e válido.')
      return
    }

    setIsRequestingEmailChange(true)
    try {
      await pb.collection('users').requestEmailChange(newEmail.trim())
      setEmailChangeNotice(
        `Um link de confirmação foi enviado para ${newEmail.trim()}. Acesse sua caixa de entrada para autorizar a alteração.`,
      )
      setNewEmail('')
    } catch (err: any) {
      console.warn('Erro ao solicitar troca de e-mail:', err)
      setEmailChangeError(
        err?.response?.message ||
          err?.message ||
          'Não foi possível solicitar a alteração de e-mail.',
      )
    } finally {
      setIsRequestingEmailChange(false)
    }
  }

  if (authLoading || (!isAuthenticated && !user)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <p>Verificando autenticação...</p>
      </div>
    )
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário'

  return (
    <div className="w-full min-h-screen bg-[#0B1020] text-slate-100 pt-28 pb-20">
      <div className="max-w-[1100px] mx-auto px-6 space-y-10">
        {/* Header & greeting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <History className="w-3.5 h-3.5 text-teal-400" />
              <span>Painel Pessoal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Meus Resultados
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Olá, <strong className="text-slate-200">{firstName}</strong>! Acompanhe seu progresso
              e histórico financeiro.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Alterar e-mail
            </Button>

            <Link to="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold shadow-md">
                <PlusCircle className="w-4 h-4 mr-2" />
                Novo diagnóstico
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary strip (three small stat cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Total diagnostics */}
          <div className="bg-[#111936] rounded-2xl p-6 border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">
                Diagnósticos realizados
              </span>
              <p className="text-3xl font-extrabold text-white mt-1 tabular-nums">{stats.count}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* 2. Latest score */}
          <div className="bg-[#111936] rounded-2xl p-6 border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">Último score</span>
              <p className="text-3xl font-extrabold text-teal-400 mt-1 tabular-nums">
                {stats.count > 0 ? stats.latest : '—'}
                <span className="text-xs text-slate-500 font-normal ml-1">/100</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* 3. Best score */}
          <div className="bg-[#111936] rounded-2xl p-6 border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">Melhor score</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1 tabular-nums">
                {stats.count > 0 ? stats.best : '—'}
                <span className="text-xs text-slate-500 font-normal ml-1">/100</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Results list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-tight">Histórico de Avaliações</h3>
            <span className="text-xs text-slate-400">Atualização em tempo real ativa</span>
          </div>

          {isLoading ? (
            <div className="bg-[#111936] rounded-2xl p-12 text-center text-slate-400 border border-slate-800">
              Carregando histórico...
            </div>
          ) : diagnostics.length === 0 ? (
            <div className="bg-[#111936] rounded-3xl p-12 text-center border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Nenhum diagnóstico registrado ainda</h4>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Você ainda não salvou nenhuma avaliação financeira. Responda o questionário rápido
                para descobrir sua pontuação e receber recomendações personalizadas.
              </p>
              <div className="pt-2">
                <Link to="/">
                  <Button className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] text-white font-semibold">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Fazer meu primeiro diagnóstico
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {diagnostics.map((diag) => {
                const tier = getScoreTier(diag.total_score)
                const isExpanded = expandedId === diag.id
                const isConfirmingDelete = deletingId === diag.id
                const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(diag.created))

                return (
                  <div
                    key={diag.id}
                    className="bg-[#111936] rounded-2xl border border-slate-800 shadow-md overflow-hidden transition-all duration-200"
                  >
                    {/* Main card row */}
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: date, tier badge, summary snippet */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-semibold text-slate-400">
                            {formattedDate}
                          </span>
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: tier.bgLight,
                              color: tier.color,
                              border: `1px solid ${tier.color}40`,
                            }}
                          >
                            {tier.tier}
                          </span>
                        </div>
                        {diag.summary && (
                          <p className="text-sm text-slate-300 italic line-clamp-1">
                            "{diag.summary}"
                          </p>
                        )}
                      </div>

                      {/* Right: score badge, actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                        <div className="text-right">
                          <span className="text-2xl font-extrabold text-white tabular-nums">
                            {diag.total_score}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/100</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle details button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedId(isExpanded ? null : diag.id)}
                            className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
                          >
                            <span>{isExpanded ? 'Ocultar' : 'Ver detalhes'}</span>
                            <ChevronDown
                              className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </Button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setDeletingId(isConfirmingDelete ? null : diag.id)}
                            title="Excluir diagnóstico"
                            className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Delete Confirmation Dialog */}
                    {isConfirmingDelete && (
                      <div className="px-6 py-3 bg-red-950/50 border-t border-red-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-red-200 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>Tem certeza de que deseja excluir este diagnóstico?</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingId(null)}
                            className="text-xs text-slate-300 hover:text-white h-7 px-2.5"
                          >
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(diag.id)}
                            className="text-xs bg-red-600 hover:bg-red-700 text-white h-7 px-3"
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Accordion expanded details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 bg-slate-900/40 space-y-6 animate-in fade-in duration-200">
                        {/* Category rating bars */}
                        <div>
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Desempenho por Categoria
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Renda */}
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                  <Wallet className="w-3.5 h-3.5 text-teal-400" />
                                  Renda
                                </span>
                                <span className="font-bold text-teal-400">
                                  {diag.income_score}/100
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded-full"
                                  style={{ width: `${diag.income_score}%` }}
                                />
                              </div>
                            </div>

                            {/* Gastos */}
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                  <Receipt className="w-3.5 h-3.5 text-sky-400" />
                                  Gastos
                                </span>
                                <span className="font-bold text-sky-400">
                                  {diag.expenses_score}/100
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 rounded-full"
                                  style={{ width: `${diag.expenses_score}%` }}
                                />
                              </div>
                            </div>

                            {/* Dívidas */}
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                                  Dívidas
                                </span>
                                <span className="font-bold text-indigo-400">
                                  {diag.debts_score}/100
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${diag.debts_score}%` }}
                                />
                              </div>
                            </div>

                            {/* Reserva e Investimentos */}
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                                  <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                                  Reserva e Investimentos
                                </span>
                                <span className="font-bold text-emerald-400">
                                  {diag.savings_score}/100
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${diag.savings_score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Saved recommendations */}
                        {diag.recommendations && diag.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                              Recomendações Registradas
                            </h5>
                            <ul className="space-y-2">
                              {diag.recommendations.map((rec, i) => (
                                <li
                                  key={i}
                                  className="p-3 bg-slate-900/70 rounded-xl border-l-2 border-teal-400 text-xs sm:text-sm text-slate-300 leading-relaxed"
                                >
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Settings / Email Change Dialog */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#111936] rounded-3xl border border-slate-700 p-6 sm:p-8 shadow-2xl z-10 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">Alterar endereço de e-mail</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-4 mb-4 leading-relaxed">
              E-mail atual: <strong className="text-slate-200">{user?.email}</strong>. Um link de
              confirmação será enviado para o novo endereço.
            </p>

            {emailChangeNotice && (
              <div className="mb-4 p-3 rounded-xl bg-teal-950/70 border border-teal-800 text-teal-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
                <span>{emailChangeNotice}</span>
              </div>
            )}

            {emailChangeError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{emailChangeError}</span>
              </div>
            )}

            <form onSubmit={handleRequestEmailChange} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300 font-medium">Novo e-mail</Label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    placeholder="novo@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 pl-10"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-300 hover:text-white"
                >
                  Fechar
                </Button>
                <Button
                  type="submit"
                  disabled={isRequestingEmailChange}
                  className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] text-white font-semibold"
                >
                  {isRequestingEmailChange ? 'Solicitando...' : 'Enviar confirmação'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
