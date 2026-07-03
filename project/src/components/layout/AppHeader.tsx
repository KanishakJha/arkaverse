import { useApp } from '../../contexts/AppContext';

export function AppHeader() {
  const { navigate } = useApp();
  return (
    <header className="fixed top-0 w-full h-14 bg-white border-b flex items-center px-4 justify-between">
      <button onClick={() => navigate({ page: 'home' })} className="font-bold">Fablex</button>
      <button onClick={() => navigate({ page: 'admin' })} className="text-xs">Studio</button>
    </header>
  );
}
