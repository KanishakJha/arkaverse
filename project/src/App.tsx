import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { AdminPage } from './pages/AdminPage'
import { ShieldCheck, User } from 'lucide-react'

function AppContent() {
  const { route, user, navigate } = useApp()
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)

  // 🔐 FEATURE 2: Private Admin Studio Gatekeeper Simulation Check
  useEffect(() => {
    if (user && (user.email === 'kanishakjha2000@gmail.com' || user.role === 'admin')) {
      setIsAdminAuthenticated(true)
    } else {
      setIsAdminAuthenticated(false)
    }
  }, [user])

  if (route?.page === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-sm text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold">Access Denied</h1>
            <p className="text-zinc-400 text-xs leading-relaxed">Unauthorized access signature detected. Only authorized Studio Administrators can manage this interface.</p>
            <button onClick={() => window.location.href = '/'} className="w-full bg-white text-black py-2 rounded-xl font-bold text-xs">Return Home</button>
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
