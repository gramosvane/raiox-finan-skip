import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B1020] text-slate-100 relative selection:bg-teal-500 selection:text-white">
      {/* Decorative ambient radial gradients */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl z-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -top-40 -right-40 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl z-0"
        aria-hidden="true"
      />

      <Navbar />

      <main className="flex-1 flex flex-col relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
