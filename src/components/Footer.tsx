import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Heart, Sparkles } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#070B16] border-t border-slate-800 text-slate-400 pt-16 pb-12 mt-auto">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#14B8A6] to-[#0EA5E9] p-[1.5px]">
                <div className="w-full h-full bg-[#0B1020] rounded-full flex items-center justify-center text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-bold text-white tracking-wide">Raio-X</span>
                <span className="text-lg font-light text-teal-400 ml-1">Financeiro</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Descubra seu score financeiro real, identifique vazamentos de renda e receba um plano
              prático para transformar sua saúde financeira.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400/90 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Diagnóstico seguro, anônimo e sem letras miúdas.</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navegação Rápida
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">
                  Fazer Diagnóstico
                </Link>
              </li>
              <li>
                <Link to="/meus-resultados" className="hover:text-teal-400 transition-colors">
                  Meus Resultados
                </Link>
              </li>
              <li>
                <a href="/#como-funciona" className="hover:text-teal-400 transition-colors">
                  Como funciona
                </a>
              </li>
              <li>
                <Link to="/auth" className="hover:text-teal-400 transition-colors">
                  Entrar ou Cadastrar
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Aviso Legal e Educacional
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              As informações fornecidas têm caráter informativo e educacional e não constituem
              recomendação financeira, investimento ou aconselhamento profissional. Decisões
              patrimoniais devem ser tomadas com base em sua análise individual e consultoria
              especializada.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2025 Raio-X Financeiro. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            Feito para ajudar brasileiros a conquistarem sua liberdade financeira
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  )
}
