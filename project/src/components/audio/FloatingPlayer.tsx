import { useApp } from '../../contexts/AppContext';
import { Play, Pause } from 'lucide-react';

export function FloatingPlayer() {
  const { currentTrack, isPlaying, setIsPlaying } = useApp();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={currentTrack.bookCover} className="size-10 rounded object-cover" />
        <div>
          <p className="text-xs font-bold truncate">{currentTrack.chapterTitle}</p>
          <p className="text-[10px] text-slate-400">{currentTrack.bookTitle}</p>
        </div>
      </div>
      <button onClick={() => setIsPlaying(!isPlaying)} className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
      </button>
    </div>
  );
}
