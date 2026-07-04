import { useState, useEffect } from 'react';
import { Play, Pause, Square, User, UserCheck } from 'lucide-react';

interface AudioPlayerProps {
  storyText: string;
}

export function AudioStoryPlayer({ storyText }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
      
      window.speechSynthesis.getVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
    
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (!synth || !storyText.trim()) return;

    if (isPaused) {
      synth.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.lang = 'hi-IN';

    const voices = synth.getVoices();
    
    let selectedVoice = null;
    if (gender === 'male') {
      selectedVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.toLowerCase().includes('male') || v.name.includes('Google')));
    } else {
      selectedVoice = voices.find(v => v.lang === 'hi-IN' && (v.name.toLowerCase().includes('female') || !v.name.includes('Google')));
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.rate = 0.95;
    utterance.pitch = gender === 'male' ? 0.9 : 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.cancel();
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

      <div className="flex items-center gap-3">
        {!isPlaying ? (
          <button
            onClick
