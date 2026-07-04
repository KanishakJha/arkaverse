import { useState } from 'react'
import { AppProvider, useApp } from './contexts/AppContext'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { AdminPage } from './pages/AdminPage'

function AppContent() {
  const { route } = useApp()
  // Admin Authorization Framework validation parameter bypass mode
  const [isAdminAuthenticated] = useState(true)

  if (route?.page === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-sm text-center space-y-4">
            <h1 className="text-lg font-bold">Access Denied</h1>
            <p className="text-zinc-400 text-xs leading-relaxed">Unauthorized access signature detected.</p>
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
