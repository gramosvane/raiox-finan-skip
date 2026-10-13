import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, FileText, Sparkles, ChevronRight, User } from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário'

  const handleStartDiagnostic = () => {
    if (location.pathname === '/') {
      const el = document.getElementById('questionnaire-container')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    navigate('/')
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0B1020]/95 backdrop-blur-md shadow-lg border-b border-slate-800/80 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform duration-150 hover:scale-[1.02]"
            aria-label="Raio-X Financeiro"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#14B8A6] to-[#0EA5E9] p-[2px] shadow-md shadow-teal-500/20">
              <div className="w-full h-full bg-[#0B1020] rounded-full flex items-center justify-center text-teal-400 group-hover:text-teal-300 transition-colors">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="text-xl font-bold text-white tracking-wide">Raio-X</span>
              <span className="text-xl font-light text-teal-400 ml-1.5">Financeiro</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Início
            </Link>
            <a
              href="/#como-funciona"
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault()
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
                }
              }}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Como funciona
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-800">
                <Link
                  to="/meus-resultados"
                  className="flex items-center gap-2 text-sm font-medium text-teal-300 hover:text-teal-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Meus Resultados</span>
                </Link>

                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/70 border border-slate-700/60 px-3 py-1.5 rounded-full">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>Olá, {firstName}</span>
                </div>

                <button
                  onClick={logout}
                  title="Sair da conta"
                  aria-label="Sair da conta"
                  className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-slate-800/50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link to="/auth">
                  <Button
                    variant="ghost"
                    className="text-slate-200 hover:text-white hover:bg-slate-800/80 text-sm font-medium"
                  >
                    Entrar
                  </Button>
                </Link>
                <Button
                  onClick={handleStartDiagnostic}
                  className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold text-sm shadow-md shadow-teal-500/20 transition-all duration-150 hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Fazer Diagnóstico
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-200 hover:text-white p-2 rounded-lg bg-slate-800/40 border border-slate-700/50"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-[280px] max-w-[85vw] bg-[#0B1020] border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#14B8A6] to-[#0EA5E9] p-[1.5px]">
                    <div className="w-full h-full bg-[#0B1020] rounded-full flex items-center justify-center text-teal-400">
                      <span className="font-bold text-xs">RX</span>
                    </div>
                  </div>
                  <span className="font-bold text-white text-base">Raio-X Financeiro</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isAuthenticated && (
                <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <User className="w-4 h-4 text-teal-400" />
                    <span>Conectado como:</span>
                  </div>
                  <p className="text-sm font-semibold text-white mt-0.5 truncate">
                    {user?.name || user?.email}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  to="/"
                  className="flex items-center justify-between py-2 text-slate-200 hover:text-teal-400 text-sm font-medium border-b border-slate-800/50"
                >
                  <span>Início</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
                <a
                  href="/#como-funciona"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-2 text-slate-200 hover:text-teal-400 text-sm font-medium border-b border-slate-800/50"
                >
                  <span>Como funciona</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>

                {isAuthenticated && (
                  <Link
                    to="/meus-resultados"
                    className="flex items-center justify-between py-2 text-teal-300 hover:text-teal-200 text-sm font-medium border-b border-slate-800/50"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Meus Resultados
                    </span>
                    <ChevronRight className="w-4 h-4 text-teal-500" />
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex flex-col gap-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              ) : (
                <>
                  <Link to="/auth" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
                    >
                      Entrar
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setMobileOpen(false)
                      handleStartDiagnostic()
                    }}
                    className="w-full bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Fazer Diagnóstico
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
