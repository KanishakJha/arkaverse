import React, { useState, useEffect } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Play, Pause, StopCircle, RotateCcw, FastForward } from 'lucide-react';

interface TTSReaderProps {
  text: string;
}

export const TTSReader: React.FC<TTSReaderProps> = ({ text }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const {
    isPlaying, isPaused, currentSentence,
    speed, setSpeed, voiceURI, setVoiceURI,
    togglePlay, stop, speak
  } = useTextToSpeech(text);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  if (!text || text.trim().length === 0) return null;

  return (
    <div className="flex flex-col gap-3 w-full p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-sm mb-4">
      {/* Current Sentence Display */}
      <div className="min-h-[2.5rem] text-sm text-zinc-300 italic border-l-2 border-blue-500 pl-3">
        {currentSentence || "▶️ Press Play to start listening..."}
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 transition text-white shadow-lg shadow-blue-600/30"
          >
            {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} fill="white" className="ml-0.5" />}
          </button>
          <button
            onClick={stop}
            className="p-2 text-zinc-400 hover:text-red-400 transition"
          >
            <StopCircle size={20} />
          </button>
          <button
            onClick={() => speak(0)}
            className="p-2 text-zinc-400 hover:text-zinc-100 transition"
            title="Restart from beginning"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Speed Control */}
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <FastForward size={14} className="rotate-90" />
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-white focus:outline-none focus:border-blue-500"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>
          </div>

          {/* Voice Selector */}
          <select
            value={voiceURI || ''}
            onChange={(e) => setVoiceURI(e.target.value || null)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500 max-w-[120px] truncate"
          >
            <option value="">Default Voice</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
