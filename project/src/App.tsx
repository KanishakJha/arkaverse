import { AppProvider, useApp } from './contexts/AppContext'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { AdminPage } from './pages/AdminPage'

function AppContent() {
  const { route } = useApp()

  // 🚀 REAL DEEP ROUTING MATRIX: Context parameters ko handle karne ka safe mechanism
  if (route?.page === 'admin') {
    return <AdminPage />
  }

  if (route?.page === 'reader') {
    return <ReaderPage />
  }

  // Fallback direct to your original dynamic baseline home view
  return <HomePage />
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
