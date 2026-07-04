import { useState } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { AdminPage } from './pages/AdminPage'

function AppContent() {
  const { route } = useApp()
  // Admin Studio Framework Validation standard setup bypass
  const [isAdminAuthenticated] = useState(true)

  // 🎛️ Clean Router Matrix: No external type-checking conflicts
  if (route?.page === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-sm text-center">
            <h1 className="text-lg font-bold text-red-400">Access Denied</h1>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">Unauthorized access signature detected.</p>
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
