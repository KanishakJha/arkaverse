import { useApp } from './contexts/AppContext'
import { SolarAura } from './components/layout/SolarAura'
import { AppHeader } from './components/layout/AppHeader'
import { FloatingPlayer } from './components/audio/FloatingPlayer'
import { SpatialMixer } from './components/audio/SpatialMixer'
import { HomePage } from './pages/HomePage'
import { ReaderPage } from './pages/ReaderPage'
import { AdminPage } from './pages/AdminPage'

export function App() {
  const { route } = useApp()

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <SolarAura />
      <AppHeader />

      <main className="relative z-10">
        {route.page === 'home' && <HomePage />}
        {route.page === 'reader' && <ReaderPage />}
        {route.page === 'admin' && <AdminPage />}
      </main>

      <FloatingPlayer />
      <SpatialMixer />
    </div>
  )
}

export default App
