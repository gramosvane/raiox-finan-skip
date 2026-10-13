import React from 'react'

export const HeroMockupCard: React.FC = () => {
  return (
    <div className="relative w-full max-w-md mx-auto transition-transform duration-300 animate-float">
      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/30 to-sky-500/30 rounded-2xl blur-xl opacity-70" />

      {/* Glass card container */}
      <div className="relative rounded-2xl bg-[#111936]/90 border border-slate-700/60 p-6 shadow-2xl backdrop-blur-md">
        {/* Header strip */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Raio-X em Tempo Real
            </span>
          </div>
          <span className="text-[11px] font-medium text-teal-400 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-800/60">
            Saúde Financeira
          </span>
        </div>

        {/* Mini Score Gauge Simulation */}
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" fill="none" stroke="#1E293B" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="url(#heroGaugeGrad)"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - 0.86)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="heroGaugeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">86</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                de 100
              </span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <span className="inline-block text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80">
              Excelente • Nível Avançado
            </span>
          </div>
        </div>

        {/* Rating bars */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Renda & Capacidade</span>
              <span className="text-teal-400 font-semibold">92%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full w-[92%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Equilíbrio de Gastos</span>
              <span className="text-sky-400 font-semibold">84%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full w-[84%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Controle de Dívidas</span>
              <span className="text-emerald-400 font-semibold">95%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-[95%]" />
            </div>
          </div>
        </div>

        {/* Recommendation mini snippet */}
        <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Potencial para acelerar investimentos mensais em até{' '}
            <strong className="text-teal-300">+25%</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
