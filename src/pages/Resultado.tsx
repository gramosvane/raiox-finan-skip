import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { diagnosticsService } from '@/services/diagnostics'
import { calculateScores, getScoreTier, getDeterministicRecommendations } from '@/lib/scoring'
import type { QuestionnaireAnswers, CategoryScores } from '@/types/diagnostic'
import { ScoreGauge } from '@/components/ScoreGauge'
import { Button } from '@/components/ui/button'
import {
  Wallet,
  Receipt,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  FileText,
  UserCheck,
} from 'lucide-react'

export default function Resultado() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  // State
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null)
  const [scores, setScores] = useState<CategoryScores | null>(null)
  const [summary, setSummary] = useState<string>('')
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Avoid double save
  const hasSavedRef = useRef(false)

  useEffect(() => {
    // 1. Try to recover from location.state first, then sessionStorage
    let currentAnswers: QuestionnaireAnswers | null = location.state?.answers || null
    let currentScores: CategoryScores | null = location.state?.scores || null

    if (!currentAnswers) {
      const storedAnswers = sessionStorage.getItem('raiox_current_answers')
      if (storedAnswers) {
        try {
          currentAnswers = JSON.parse(storedAnswers)
        } catch {
          currentAnswers = null
        }
      }
    }

    if (!currentAnswers) {
      // No answers available; redirect to home
      navigate('/', { replace: true })
      return
    }

    if (!currentScores) {
      currentScores = calculateScores(currentAnswers)
    }

    setAnswers(currentAnswers)
    setScores(currentScores)

    // Set fallback deterministic recommendations immediately so the user doesn't wait with an empty report
    const fallback = getDeterministicRecommendations(currentScores, currentAnswers)
    setSummary(fallback.summary)
    setRecommendations(fallback.recommendations)

    // Request AI Report (once)
    let isCancelled = false
    setIsAiLoading(true)

    diagnosticsService
      .requestAIReport(currentScores, currentAnswers)
      .then((aiRes) => {
        if (isCancelled) return
        if (aiRes.summary && aiRes.recommendations && aiRes.recommendations.length > 0) {
          setSummary(aiRes.summary)
          setRecommendations(aiRes.recommendations)
        }
      })
      .finally(() => {
        if (!isCancelled) setIsAiLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [location.state, navigate])

  // Automatically persist if authenticated and not yet saved
  useEffect(() => {
    if (!isAuthenticated || !scores || !answers || hasSavedRef.current) return

    hasSavedRef.current = true
    diagnosticsService
      .createDiagnostic({
        scores,
        answers,
        summary,
        recommendations,
      })
      .then(() => {
        setIsSaved(true)
      })
      .catch((err) => {
        console.warn('Erro ao salvar diagnóstico:', err)
        setSaveError('Não foi possível sincronizar o histórico automaticamente.')
      })
  }, [isAuthenticated, scores, answers, summary, recommendations])

  if (!scores || !answers) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400">
        <p>Carregando seu diagnóstico...</p>
      </div>
    )
  }

  const tier = getScoreTier(scores.total)
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const handleRetake = () => {
    sessionStorage.removeItem('raiox_current_answers')
    sessionStorage.removeItem('raiox_current_scores')
    navigate('/')
  }

  return (
    <div className="w-full min-h-screen bg-[#0B1020] text-slate-100 pt-24 pb-20">
      <div className="max-w-[1000px] mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Relatório Concluído</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Seu Raio-X Financeiro
          </h1>
          <p className="text-slate-400 text-sm sm:text-base capitalize">
            Gerado em {todayFormatted}
          </p>
        </div>

        {/* Score Hero Card (dark gradient card centered, max-w ~720px) */}
        <div className="max-w-[720px] mx-auto rounded-3xl bg-gradient-to-b from-[#111936] to-[#0D132A] border border-slate-700/70 p-8 sm:p-10 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-teal-500/10 blur-3xl pointer-events-none" />

          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
            Score de Saúde Financeira
          </p>

          <div className="flex justify-center mb-4">
            <ScoreGauge score={scores.total} tierName={tier.tier} color={tier.color} />
          </div>

          {/* Rating badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-4"
            style={{
              backgroundColor: tier.bgLight,
              color: tier.color,
              border: `1px solid ${tier.color}40`,
            }}
          >
            <span>Nível: {tier.tier}</span>
          </div>

          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">{tier.description}</p>

          {/* AI-generated summary line */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-sm sm:text-base leading-relaxed italic relative">
            {isAiLoading && (
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-ping mr-2" />
            )}
            "{summary}"
          </div>
        </div>

        {/* Category Breakdown Section (light background container) */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 text-slate-900 border border-slate-200 shadow-lg space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Análise por categoria
            </h2>
            <p className="text-slate-500 text-sm">
              Veja o desempenho detalhado de cada pilar da sua vida financeira.
            </p>
          </div>

          {/* 4 category cards in a 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 1. Renda */}
            <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-[#E4E9F2] hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">Renda</h4>
                    <span className="text-xs text-slate-500">Capacidade de ganho</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-teal-600">{scores.income}/100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${scores.income}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-slate-500">Avaliação:</span>
                <span className="font-semibold text-slate-700">
                  {getScoreTier(scores.income).tier}
                </span>
              </div>
            </div>

            {/* 2. Gastos */}
            <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-[#E4E9F2] hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">Gastos</h4>
                    <span className="text-xs text-slate-500">Equilíbrio de orçamento</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-sky-600">{scores.expenses}/100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${scores.expenses}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-slate-500">Avaliação:</span>
                <span className="font-semibold text-slate-700">
                  {getScoreTier(scores.expenses).tier}
                </span>
              </div>
            </div>

            {/* 3. Dívidas */}
            <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-[#E4E9F2] hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">Dívidas</h4>
                    <span className="text-xs text-slate-500">Controle de passivos</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-indigo-600">{scores.debts}/100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${scores.debts}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-slate-500">Avaliação:</span>
                <span className="font-semibold text-slate-700">
                  {getScoreTier(scores.debts).tier}
                </span>
              </div>
            </div>

            {/* 4. Reserva e Investimentos */}
            <div className="p-5 rounded-2xl bg-[#F6F8FC] border border-[#E4E9F2] hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      Reserva e Investimentos
                    </h4>
                    <span className="text-xs text-slate-500">Proteção e futuro</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-emerald-600">
                  {scores.savings}/100
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${scores.savings}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-slate-500">Avaliação:</span>
                <span className="font-semibold text-slate-700">
                  {getScoreTier(scores.savings).tier}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Recomendações para melhorar
              </h3>
              <p className="text-slate-400 text-sm">
                Passos práticos priorizados pelo algoritmo com base nas suas menores pontuações.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-teal-400 bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plano personalizado</span>
            </div>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#111936] border-l-4 border-l-teal-400 border border-slate-800 p-5 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-slate-200 text-sm sm:text-base leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Save / Account CTA Section (light background) */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 text-slate-900 border border-slate-200 shadow-xl">
          {!isAuthenticated ? (
            <div className="text-center max-w-xl mx-auto space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Quer acompanhar sua evolução?
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Crie uma conta grátis para salvar este resultado e comparar sua evolução ao longo do
                tempo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/auth"
                  state={{ from: '/resultado', mode: 'register' }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold px-6"
                  >
                    Criar conta grátis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link
                  to="/auth"
                  state={{ from: '/resultado', mode: 'login' }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full sm:w-auto text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium"
                  >
                    Já tenho conta — Entrar
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Resultado salvo no seu histórico.
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Vinculado à conta de{' '}
                    <strong className="text-slate-700">{user?.name || user?.email}</strong>.
                  </p>
                  {saveError && <p className="text-xs text-amber-600 mt-1">{saveError}</p>}
                </div>
              </div>

              <Link to="/meus-resultados">
                <Button
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver meus resultados
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Refazer diagnóstico button */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={handleRetake}
            className="text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refazer diagnóstico
          </Button>
        </div>
      </div>
    </div>
  )
}
