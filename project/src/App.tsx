import { useState } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { AdminPage } from './pages/AdminPage'
import { KeyRound } from 'lucide-react'

function AppContent() {
  const { route } = useApp()
  
  // 🔐 SECURE GATEKEEPER STATE MATRIX
  const [inputPassword, setInputPassword] = useState('')
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Your cryptographic pattern secret key string
  const MASTER_SECRET_HASH = "K9#vP2!wLq8*Zm"

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputPassword === MASTER_SECRET_HASH) {
      setIsAdminAuthenticated(true)
      setErrorMessage('')
    } else {
      setErrorMessage('❌ Invalid Security Signature Code! Access Terminated.')
      setInputPassword('')
    }
  }

  if (route?.page === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4 select-none">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Top Security Glow Warning pattern */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-red-500/10 blur-xl rounded-full" />
            
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <KeyRound className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h1 className="text-base font-black tracking-wide">Studio Engine Matrix Lock</h1>
              <p className="text-zinc-500 text-xs font-medium leading-normal">
                This sector contains encrypted creator modules. Enter administration token sequence to grant access root.
              </p>
            </div>

            <form onSubmit={handleAdminVerify} className="space-y-3 pt-2">
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 w-4 h-4 text-zinc-500" />
                <input 
                  type="password" 
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Enter Admin Private Password..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500/50 transition font-medium text-center tracking-widest placeholder:tracking-normal placeholder:text-zinc-600"
                />
              </div>

              {errorMessage && (
                <p className="text-[10px] font-black text-red-400 bg-red-500/5 py-1.5 rounded-lg border border-red-500/10">
                  {errorMessage}
                </p>
              )}

              <button 
                type="submit" 
                className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow transition transform active:scale-98"
              >
                Execute Auth Signature 🔓
              </button>
            </form>

            <button 
              type="button"
              onClick={() => { window.location.href = "/"; }}
              className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition block mx-auto pt-2"
            >
              Cancel & Return Home
            </button>
          </div>
        </div>
      )
    }
    return <AdminPage />
  }

  if (route?.page === 'reader') {
    return <ReaderPage />
  }

  return <HomePage />
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
