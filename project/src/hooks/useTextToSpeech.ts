import { useState, useRef, useCallback, useEffect } from 'react';

export const useTextToSpeech = (text: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentence, setCurrentSentence] = useState('');
  const [speed, setSpeed] = useState(1);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);

  const processText = useCallback((rawText: string) => {
    const matches = rawText.match(/[^.!?]+[.!?]+/g);
    sentencesRef.current = matches && matches.length > 0 ? matches : [rawText];
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    processText(text);
  }, [text, processText]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentence('');
  }, []);

  const speak = useCallback((startFromSentenceIndex = 0) => {
    if (typeof window === 'undefined' || !sentencesRef.current.length) return;
    
    // Basic text caching: prevent re-speaking the exact same text quickly
    const lastSpokenHash = sessionStorage.getItem('tts_hash');
    const currentHash = text.substring(0, 80);
    if (lastSpokenHash === currentHash && startFromSentenceIndex === 0) {
      // It's already loaded in session, continue
    }
    sessionStorage.setItem('tts_hash', currentHash);

    stop(); // Cancel previous speech

    const speakSentence = (index: number) => {
      if (index >= sentencesRef.current.length) {
        setIsPlaying(false);
        setCurrentSentence('');
        return;
      }

      const sentence = sentencesRef.current[index];
      setCurrentSentence(sentence);

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = speed;
      
      const voice = voiceURI ? window.speechSynthesis.getVoices().find(v => v.voiceURI === voiceURI) : null;
      if (voice) utterance.voice = voice;
      
      utteranceRef.current = utterance;

      utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
      utterance.onend = () => speakSentence(index + 1); // Automatically move to next sentence
      
      window.speechSynthesis.speak(utterance);
    };

    speakSentence(startFromSentenceIndex);
  }, [text, speed, voiceURI, stop]);

  const pause = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying && !isPaused) pause();
    else if (isPlaying && isPaused) resume();
    else speak(0);
  }, [isPlaying, isPaused, speak, pause, resume]);

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.getVoices();
  }, []);

  return {
    isPlaying,
    isPaused,
    currentSentence,
    speed,
    setSpeed,
    voiceURI,
    setVoiceURI,
    togglePlay,
    stop,
    speak,
    pause,
    resume
  };
};
