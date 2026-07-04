import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";

interface PremiumAudioPlayerProps {
  audioSrc: string;
  title?: string;
}

export default function PremiumAudioPlayer({ 
  audioSrc, 
  title = "Now Playing" 
}: PremiumAudioPlayerProps) {
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(1);

  // Time format karne ka function (00:00)
  const formatTime = (time: number) => {
    if (!time) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch((err) => console.error(err));
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const changeSpeed = (speedVal: number) => {
    setSpeed(speedVal);
    if (audioRef.current) {
      audioRef.current.playbackRate = speedVal;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900 text-white p-6 rounded-2xl shadow-2xl shadow-black/50 border border-zinc-800 backdrop-blur-sm">
      
      {/* Top Row - Title & Speed Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-zinc-300 truncate max-w-[150px]">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => changeSpeed(s)}
              className={`px-2 py-1 text-xs rounded-md font-semibold transition-all ${
                speed === s ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Hidden HTML Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Progress Bar */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100 || 0}%, #3f3f46 ${(currentTime / duration) * 100 || 0}%, #3f3f46 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Play/Pause Controls */}
      <div className="flex items-center justify-center gap-6">
        <button className="text-zinc-400 hover:text-white transition">
          <SkipBack size={20} />
        </button>
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30"
        >
          {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
        </button>
        <button className="text-zinc-400 hover:text-white transition">
          <SkipForward size={20} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {volume === 0 ? <VolumeX size={18} className="text-zinc-400" /> : <Volume2 size={18} className="text-zinc-400" />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #3f3f46 ${volume * 100}%, #3f3f46 100%)`,
          }}
        />
      </div>
    </div>
  );
}
