import React from 'react'
import { Questionnaire } from '@/components/Questionnaire'
import { HeroMockupCard } from '@/components/HeroMockupCard'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  ClipboardCheck,
  Gauge,
  TrendingUp,
  Clock,
  ShieldCheck,
  BarChart3,
  ArrowDown,
} from 'lucide-react'

export default function Index() {
  const scrollToQuestionnaire = () => {
    const el = document.getElementById('questionnaire-container')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToComoFunciona = () => {
    const el = document.getElementById('como-funciona')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section (full viewport height, dark gradient background) */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 bg-gradient-to-b from-[#0B1020] via-[#0F173D] to-[#0B1020] overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, subheadline, CTAs, trust strip */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/70 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Diagnóstico Financeiro Inteligente</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Veja sua <span className="text-teal-400">saúde</span> financeira em um raio-X.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Responda um diagnóstico rápido e descubra seu score financeiro, seus pontos fortes e
                o que melhorar — em menos de 5 minutos.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={scrollToQuestionnaire}
                  className="w-full sm:w-auto text-base font-semibold px-8 py-6 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white shadow-xl shadow-teal-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Começar diagnóstico grátis
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={scrollToComoFunciona}
                  className="w-full sm:w-auto text-base font-medium px-6 py-6 rounded-xl border-slate-700 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  Ver como funciona
                </Button>
              </div>

              {/* Trust strip */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>5 minutos</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% anônimo</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>Relatório instantâneo</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual (Floating stylized card) */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroMockupCard />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-slate-500 text-xs animate-bounce pointer-events-none">
          <span>Role para baixo</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </div>
      </section>

      {/* 2. "Como funciona" Section (light background #F6F8FC) */}
      <section
        id="como-funciona"
        className="w-full py-20 bg-[#F6F8FC] text-slate-900 scroll-mt-16 border-y border-slate-200"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-100/70 px-3 py-1 rounded-full">
              Passo a Passo
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Como funciona o Raio-X Financeiro
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Em apenas 3 etapas você descobre exatamente o que fazer com o seu dinheiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E4E9F2] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 shadow-inner">
                <ClipboardCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Etapa 1
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">Responda o diagnóstico</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Responda a 11 perguntas práticas sobre renda, despesas mensais, dívidas e hábitos de
                reserva de forma rápida e segura.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E4E9F2] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 shadow-inner">
                <Gauge className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Etapa 2
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">Receba seu score</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Nosso algoritmo calcula instantaneamente sua pontuação geral de 0 a 100 com o
                detalhamento por categoria financeira.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-[#E4E9F2] shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-inner">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Etapa 3
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 mb-3">Melhore seus hábitos</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Receba recomendações personalizadas com inteligência artificial para eliminar
                dívidas, guardar dinheiro e investir com segurança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Questionnaire Section (Core anchor) */}
      <section className="w-full py-20 bg-gradient-to-b from-[#0B1020] via-[#0F173D] to-[#0B1020] relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-800/80">
              Início do Teste
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Faça agora o seu Raio-X
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Sem cadastro prévio. Suas respostas são anônimas e processadas na hora.
            </p>
          </div>

          <Questionnaire />
        </div>
      </section>
    </div>
  )
}
