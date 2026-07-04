// @ts-nocheck

import React, { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
};

export default function AudioStoryPlayer({
  text,
  className = "",
}: Props) {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [voicesReady, setVoicesReady] = useState(false);
  const [maleVoice, setMaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [femaleVoice, setFemaleVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [gender, setGender] = useState<"male" | "female">("female");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * Load voices reliably.
   * Browser loads voices asynchronously.
   */
  const loadVoices = useCallback(() => {
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synthRef.current = synth;

    const voices = synth.getVoices();

    if (!voices.length) return;

    voicesRef.current = voices;

    const hindiVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith("hi")
    );

    const all = hindiVoices.length ? hindiVoices : voices;

    let female =
      all.find((v) =>
        /(female|woman|google हिन्दी|google hindi|sangeeta|heera|zira)/i.test(
          v.name
        )
      ) || all[0];

    let male =
      all.find((v) =>
        /(male|man|hemant|ravi|amit|raj)/i.test(v.name)
      ) || all[1] || all[0];

    setFemaleVoice(female || null);
    setMaleVoice(male || null);

    setVoicesReady(true);
  }, []);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [loadVoices]);

  /**
   * PLAY
   * Important:
   * SpeechSynthesisUtterance is created INSIDE
   * the synchronous button click.
   */
  const handlePlay = () => {
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "hi-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.voice =
      gender === "female"
        ? femaleVoice || null
        : maleVoice || null;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;

    // Required to happen directly in click handler
    synth.speak(utterance);
  };

  const handlePause = () => {
    const synth = synthRef.current;
    if (!synth) return;

    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    const synth = synthRef.current;
    if (!synth) return;

    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    const synth = synthRef.current;
    if (!synth) return;

    synth.cancel();

    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!("speechSynthesis" in window)) {
    return (
      <div className="rounded-xl bg-red-500/10 p-4 text-red-400">
        Your browser does not support Web Speech API.
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl border border-zinc-700 bg-zinc-900 p-5 shadow-lg ${className}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Story Audio
          </h2>

          <p className="text-sm text-zinc-400">
            {voicesReady
              ? "Hindi voices loaded"
              : "Loading voices..."}
          </p>
        </div>

        <div className="flex rounded-full bg-zinc-800 p-1">
          <button
            onClick={() => setGender("male")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              gender === "male"
                ? "bg-blue-600 text-white"
                : "text-zinc-400"
            }`}
          >
            Male
          </button>

          <button
            onClick={() => setGender("female")}
            className={`rounded-full px-4 py-2 text-sm transition ${
              gender === "female"
                ? "bg-pink-600 text-white"
                : "text-zinc-400"
            }`}
          >
            Female
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePlay}
          className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-500 active:scale-95"
        >
          ▶ Play
        </button>

        {!isPaused ? (
          <button
            onClick={handlePause}
            disabled={!isPlaying}
            className="rounded-xl bg-yellow-500 px-5 py-3 font-medium text-black transition disabled:opacity-40"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition"
          >
            ▶ Resume
          </button>
        )}

        <button
          onClick={handleStop}
          className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-500 active:scale-95"
        >
          ■ Stop
        </button>
      </div>

      <div className="mt-5 rounded-xl bg-zinc-800 p-3 text-sm text-zinc-400">
        Status:&nbsp;
        {isPlaying
          ? isPaused
            ? "Paused"
            : "Playing"
          : "Stopped"}
      </div>
    </div>
  );
        }
