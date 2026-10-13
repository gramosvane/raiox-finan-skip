import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="w-16 h-16 rounded-3xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-extrabold text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mb-4">Página não encontrada</h2>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/">
        <Button className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] text-white font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para a página inicial
        </Button>
      </Link>
    </div>
  )
}
