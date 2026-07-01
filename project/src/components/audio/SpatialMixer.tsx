import { useEffect, useRef } from 'react'
import { X, Volume2, Wind } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'
import { AURA_THEMES } from '../../types'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'


function createAmbientNoise(ctx: AudioContext, type: string): GainNode {
  const masterGain = ctx.createGain()
  masterGain.connect(ctx.destination)

  if (type === 'rain' || type === 'thunder') {
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (type === 'thunder' ? 0.3 : 0.15)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = type === 'rain' ? 'highpass' : 'lowpass'
    filter.frequency.value = type === 'rain' ? 800 : 200

    source.connect(filter)
    filter.connect(masterGain)
    source.start()
  } else if (type === 'forest') {
    // Gentle oscillator modulation
    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = 180 + Math.random() * 40

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.3
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 30
    lfo.connect(lfoGain)
    lfoGain.connect(osc1.frequency)

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 600
    filter.Q.value = 0.5

    osc1.connect(filter)
    filter.connect(masterGain)
    osc1.start()
    lfo.start()
  } else if (type === 'drone') {
    // Deep sine drone
    const freqs = [55, 82.4, 110]
    for (const f of freqs) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = f
      const g = ctx.createGain()
      g.gain.value = 0.08
      osc.connect(g)
      g.connect(masterGain)
      osc.start()
    }
  } else if (type === 'tension') {
    // Pulsing tension pad
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 220

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.8
    const lfoG = ctx.createGain()
    lfoG.gain.value = 0.4
    lfo.connect(lfoG)
    lfoG.connect(osc.frequency)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400

    osc.connect(filter)
    filter.connect(masterGain)
    osc.start()
    lfo.start()
  }

  return masterGain
}

export function SpatialMixer() {
  const { mixerTracks, setMixerTrackVolume, toggleMixerTrack, mixerOpen, setMixerOpen, auraTheme } = useApp()
  const ctxRef = useRef<AudioContext | null>(null)
  const gainNodesRef = useRef<Record<string, GainNode>>({})
  const colors = AURA_THEMES[auraTheme]

  // Init or update Web Audio nodes when tracks change
  useEffect(() => {
    for (const track of mixerTracks) {
      if (track.playing) {
        if (!ctxRef.current) {
          ctxRef.current = new AudioContext()
        }
        if (!gainNodesRef.current[track.id]) {
          const gain = createAmbientNoise(ctxRef.current, track.id)
          gain.gain.value = track.volume / 100
          gainNodesRef.current[track.id] = gain
        }
        gainNodesRef.current[track.id].gain.value = track.volume / 100
        if (ctxRef.current.state === 'suspended') {
          ctxRef.current.resume()
        }
      } else {
        if (gainNodesRef.current[track.id]) {
          gainNodesRef.current[track.id].gain.value = 0
        }
      }
    }
  }, [mixerTracks])

  if (!mixerOpen) return null

  return (
    <div
      className="fixed bottom-[72px] right-4 z-50 glass-strong rounded-2xl w-72 shadow-2xl"
      style={{ boxShadow: `0 0 0 1px ${colors.primary}20, 0 20px 60px rgba(0,0,0,0.6)` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/5 rounded-t-2xl"
        style={{ background: `linear-gradient(135deg, ${colors.primary}12, ${colors.secondary}08)` }}
      >
        <div className="flex items-center gap-2">
          <Wind className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">Spatial Mixer</span>
        </div>
        <Button variant="ghost" size="icon" className="size-6" onClick={() => setMixerOpen(false)}>
          <X className="size-3" />
        </Button>
      </div>

      {/* Tracks */}
      <div className="p-3 space-y-3">
        {mixerTracks.map((track) => (
          <div key={track.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">{track.emoji}</span>
                <Label className="text-xs text-muted-foreground">{track.label}</Label>
              </div>
              <Switch
                checked={track.playing}
                onCheckedChange={() => toggleMixerTrack(track.id)}
                size="sm"
              />
            </div>
            {track.playing && (
              <div className="flex items-center gap-2">
                <Volume2 className="size-3 text-muted-foreground shrink-0" />
                <Slider
                  min={0} max={100}
                  value={[track.volume]}
                  onValueChange={([v]) => setMixerTrackVolume(track.id, v)}
                  className="flex-1"
                />
                <span className="text-[10px] text-muted-foreground w-7 text-right">
                  {track.volume}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active count */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {mixerTracks.filter((t) => t.playing).length} active tracks
        </span>
        <Badge
          variant="outline"
          className="text-[10px] px-2"
          style={{ borderColor: `${colors.primary}30`, color: colors.primary }}
        >
          Spatial Audio
        </Badge>
      </div>
    </div>
  )
}
