import { AppProvider } from './contexts/AppContext'
import { MainLayout } from './components/MainLayout'

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  )
}
