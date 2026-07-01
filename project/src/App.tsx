import { useEffect, useState } from 'react';
import { useApp } from './contexts/AppContext';
import { SolarAura } from './components/layout/SolarAura';
import { AppHeader } from './components/layout/AppHeader';
import { FloatingPlayer } from './components/audio/FloatingPlayer';
import { SpatialMixer } from './components/audio/SpatialMixer';
import { HomePage } from './pages/HomePage';
import { ReaderPage } from './pages/ReaderPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const { route } = useApp();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // 1. Anti-Copy and Security Protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("ArkaVerse Content is Protected!");
    };

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

  // 2. Admin Page Password Lock
  useEffect(() => {
    if (route.page === 'admin' && !isAdminAuthenticated) {
      // Yahan aap apna manpasand secret password badal sakte ho (Abhi 'ArkaAdmin123' rakha hai)
      const password = prompt("Enter Secret Admin Password to Access Showroom:");
      
      if (password === "ArkaAdmin123") {
        setIsAdminAuthenticated(true);
      } else {
        alert("Wrong Password! Access Denied.");
        window.location.href = "/"; // Galat password par home par bhej dega
      }
    }
  }, [route.page, isAdminAuthenticated]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <SolarAura />
      <AppHeader />

      <main className="relative z-10">
        {route.page === 'home' && <HomePage />}
        {route.page === 'reader' && <ReaderPage />}
        
        {/* Sirf sahi password waale ko hi Admin Page dikhega */}
        {route.page === 'admin' && (
          isAdminAuthenticated ? (
            <AdminPage />
          ) : (
            <div className="p-8 text-center text-red-500 font-bold">
              Unauthorized Access. Please refresh and enter correct password.
            </div>
          )
        )}
      </main>

      <FloatingPlayer />
      <SpatialMixer />
    </div>
  );
}
