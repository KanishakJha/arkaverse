import { useEffect } from 'react';
import { useApp } from './contexts/AppContext';
import { SolarAura } from './components/layout/SolarAura';
import { AppHeader } from './components/layout/AppHeader';
import { FloatingPlayer } from './components/audio/FloatingPlayer';
import { SpatialMixer } from './components/audio/SpatialMixer';
import { HomePage } from './pages/HomePage';
import { ReaderPage } from './pages/ReaderPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const { route } = useApp();

  useEffect(() => {
    // 1. Right-Click block karne ke liye
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("ArkaVerse Content is Protected!");
    };

    // 2. Ctrl+C, Ctrl+S, Ctrl+U aur F12 shortcuts block karne ke liye
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 's' || e.key === 'u' || e.key === 'C' || e.key === 'S' || e.key === 'U')) {
        e.preventDefault();
        alert("Copying or Saving content is not allowed!");
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
  );
}
