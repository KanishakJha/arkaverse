import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  isPlaying: boolean
  color1: string
  color2: string
  height?: number
}

export function AudioVisualizer({ isPlaying, color1, color2, height = 48 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number | undefined>(undefined)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const BAR_COUNT = 40

    function render() {
      const w = canvas!.width
      const h = canvas!.height
      ctx!.clearRect(0, 0, w, h)

      const barW = w / BAR_COUNT - 1.5

      for (let i = 0; i < BAR_COUNT; i++) {
        const phase = (i / BAR_COUNT) * Math.PI * 2
        let amp = 0

        if (isPlaying) {
          // Layered sine waves for organic waveform
          amp =
            Math.abs(Math.sin(timeRef.current * 2.1 + phase)) * 0.55 +
            Math.abs(Math.sin(timeRef.current * 3.7 + phase * 1.3)) * 0.28 +
            Math.abs(Math.sin(timeRef.current * 5.2 + phase * 0.7)) * 0.17
          amp = Math.min(1, amp)
        } else {
          // Idle: tiny static pulse
          amp = 0.04 + Math.abs(Math.sin(i * 0.5)) * 0.04
        }

        const barH = Math.max(2, amp * h * 0.9)
        const x = i * (barW + 1.5)
        const y = (h - barH) / 2

        // Gradient fill per bar
        const grad = ctx!.createLinearGradient(x, y, x, y + barH)
        grad.addColorStop(0, color1 + 'cc')
        grad.addColorStop(1, color2 + '66')

        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.roundRect(x, y, barW, barH, 2)
        ctx!.fill()
      }

      if (isPlaying) timeRef.current += 0.04
      frameRef.current = requestAnimationFrame(render)
    }

    frameRef.current = requestAnimationFrame(render)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [isPlaying, color1, color2])

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    })
    observer.observe(canvas)
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    return () => observer.disconnect()
  }, [height])

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height: `${height}px`, display: 'block' }}
    />
  )
}
