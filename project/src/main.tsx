import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import { AppProvider } from './contexts/AppContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Updated storageKey to match Fablex Ecosystem */}
    <ThemeProvider defaultTheme="dark" storageKey="fablex-theme">
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeProvider>
  </StrictMode>
)
