import { useState, useEffect } from 'react';
import { Play, Pause, Square, User, UserCheck } from 'lucide-react';

interface AudioPlayerProps {
  storyText: string; // Jo kahani play karni hai wo props se aayegi
}

export function AudioStoryPlayer({ storyText }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
    
    // Agar page band ho ya change ho toh audio band ho jaye
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (!synth || !storyText.trim()) return;

    // Agar pehle se paused hai toh resume karo
    if (isPaused) {
      synth.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // Naya audio request create karo
    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.lang = 'hi-IN'; // Hindi text reading ke liye

    // Browser ki available voices me se select karo
    const voices = synth.getVoices();
    
    // Gender ke hisab se voice filter
    let selectedVoice = null;
    if (gender === 'male') {
      // Chrome/Edge mein Google ki deep voice hoty hai male ke liye
      selectedVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.toLowerCase().includes('male') || v.name.includes('Google')));
    } else {
      selectedVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.toLowerCase().includes('female') || !v.name.includes('Google')));
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    // Premium/Storytelling feel ke liye pitch aur speed tuning
    utterance.rate = 0.95; // Kahani clear samajh aaye isliye thoda sa slow (1.0 default se)
    utterance.pitch = gender === 'male' ? 0.9 : 1.0; // Male voice ko thoda aur heavy tone dene ke liye

    // Event listeners taaki buttons automatically update ho sakein
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    // Purana chal raha ho toh cancel karke naya shuru karo
    synth.cancel();
    setCurrentUtterance(utterance);
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (synth && isPlaying) {
      synth.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-white max-w-md my-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold tracking-wide text-gray-400">LISTEN STORY (AI AUDIO)</h4>
        
        {/* Voice Selectors */}
        <div className="flex gap-2 bg-gray-800 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => { setGender('male'); handleStop(); }}
            className={`px-3 py-1 rounded flex items-center gap-1 transition ${gender === 'male' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
          >
            <User className="w-3 h-3" /> Male
          </button>
          <button
            type="button"
            onClick={() => { setGender('female'); handleStop(); }}
            className={`px-3 py-1 rounded flex items-center gap-1 transition ${gender === 'female' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}
          >
            <UserCheck className="w-3 h-3" /> Female
          </button>
        </div>
      </div>

      {/* Audio Controls Grid */}
      <div className="flex items-center gap-3">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition"
          >
            <Play className="w-4 h-4 fill-current" /> Listen
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-medium transition"
          >
            <Pause className="w-4 h-4 fill-current" /> Pause
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
          >
            <Square className="w-4 h-4 fill-current" /> Stop
          </button>
        )}
      </div>
    </div>
  );
}
