import { useState } from 'react'
import { ReaderPage } from './pages/ReaderPage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  // Pure independent fallback routing matching active windows location
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname
    return path === '/admin' ? 'admin' : path === '/reader' ? 'reader' : 'home'
  })

  return (
    <div className="w-full min-h-screen bg-zinc-950 selection:bg-emerald-500/30 selection:text-emerald-400">
      {currentPath === 'admin' && <AdminPage />}
      {currentPath === 'reader' && <ReaderPage />}
      {currentPath === 'home' && (
        <div className="w-full">
          {/* Micro dynamic header block layout switcher */}
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center border-b border-zinc-900">
            <span 
              onClick={() => setCurrentPath('home')} 
              className="text-lg font-black tracking-wider text-white cursor-pointer select-none bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent"
            >
              PRALAY STUDIO
            </span>
            <button 
              type="button"
              onClick={() => setCurrentPath('admin')}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition"
            >
              Creator Studio Panel ⚙️
            </button>
          </div>

          {/* MAIN SIMULATED USER DASHBOARD WORKSPACE */}
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white sm:text-3xl">Welcome back! 👋</h1>
              <p className="text-zinc-400 text-xs sm:text-sm">Your Indian Horror Narrative ecosystem and manuscript series control dashboard.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div 
                onClick={() => setCurrentPath('reader')}
                className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700/80 p-5 rounded-2xl flex flex-col gap-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/20"
              >
                <div className="w-full h-44 rounded-xl overflow-hidden border border-zinc-800/80 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400" 
                    alt="Pralay Cover" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 tracking-wider uppercase border border-emerald-500/20">
                    LIVE STREAMING
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">PRALAY (Series Bundle)</h3>
                  <p className="text-zinc-500 text-[11px] font-medium mt-0.5">Author Studio • Horror Fiction</p>
                  <p className="text-zinc-400 text-xs mt-2 line-clamp-2">An atmospheric Indian zombie apocalypse survival thriller tracking structural chaos.</p>
                </div>
                <div className="pt-2">
                  <span className="w-full inline-flex items-center justify-center py-2 bg-white text-black text-xs font-bold rounded-xl group-hover:bg-emerald-400 transition-colors">
                    Open Voice Studio Player 🎧
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
