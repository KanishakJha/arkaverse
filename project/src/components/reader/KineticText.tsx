import { useEffect, useRef, useState } from 'react'

interface KineticTextProps {
  content: string
  isPlaying: boolean
  playbackSpeed: number
  typographyClass: string
  fontSize: number
  onProgress: (pct: number) => void
}

export function KineticText({
  content,
  isPlaying,
  playbackSpeed,
  typographyClass,
  fontSize,
  onProgress,
}: KineticTextProps) {
  const sentences = content.split(/(?<=[.!?…])\s+/).filter(Boolean)
  const [activeIdx, setActiveIdx] = useState(-1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([])

  const avgWordsPerSentence =
    sentences.length > 0
      ? sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0) / sentences.length
      : 10

  // ms per sentence based on ~200 wpm base rate and playback speed
  const msPerSentence = (avgWordsPerSentence / 200) * 60 * 1000 / playbackSpeed

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    if (!isPlaying) return

    if (activeIdx === -1) setActiveIdx(0)

    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => {
        const next = prev + 1
        if (next >= sentences.length) {
          clearInterval(intervalRef.current!)
          onProgress(100)
          return prev
        }
        onProgress((next / sentences.length) * 100)
        return next
      })
    }, msPerSentence)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, playbackSpeed, msPerSentence, sentences.length])

  // Auto-scroll active sentence into view
  useEffect(() => {
    if (activeIdx >= 0 && sentenceRefs.current[activeIdx]) {
      sentenceRefs.current[activeIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIdx])

  // Reset when content changes
  useEffect(() => {
    setActiveIdx(-1)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [content])

  return (
    <div
      className={`leading-[1.85] tracking-wide ${typographyClass}`}
      style={{ fontSize: `${fontSize}px` }}
    >
      {sentences.map((sentence, i) => (
        <span
          key={i}
          ref={(el) => { sentenceRefs.current[i] = el }}
          className={
            activeIdx === -1
              ? 'text-foreground'
              : i === activeIdx
              ? 'kinetic-active'
              : i < activeIdx
              ? 'kinetic-inactive'
              : 'text-foreground/50'
          }
          style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
          onClick={() => setActiveIdx(i)}
        >
          {sentence}{' '}
        </span>
      ))}
    </div>
  )
}
