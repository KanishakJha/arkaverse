import { useApp } from '../../contexts/AppContext'
import { AURA_THEMES } from '../../types'

export function SolarAura() {
  const { auraTheme } = useApp()
  const colors = AURA_THEMES[auraTheme]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Primary orb */}
      <div
        className="aura-orb-a absolute rounded-full blur-[120px]"
        style={{
          width: '70vw',
          height: '70vw',
          maxWidth: '900px',
          maxHeight: '900px',
          top: '-20%',
          left: '-15%',
          background: `radial-gradient(ellipse at center, ${colors.primary}55 0%, ${colors.primary}22 40%, transparent 70%)`,
        }}
      />
      {/* Secondary orb */}
      <div
        className="aura-orb-b absolute rounded-full blur-[140px]"
        style={{
          width: '60vw',
          height: '60vw',
          maxWidth: '800px',
          maxHeight: '800px',
          top: '30%',
          right: '-20%',
          background: `radial-gradient(ellipse at center, ${colors.secondary}44 0%, ${colors.secondary}18 45%, transparent 70%)`,
        }}
      />
      {/* Accent orb */}
      <div
        className="aura-orb-c absolute rounded-full blur-[100px]"
        style={{
          width: '40vw',
          height: '40vw',
          maxWidth: '600px',
          maxHeight: '600px',
          bottom: '-10%',
          left: '30%',
          background: `radial-gradient(ellipse at center, ${colors.accent}33 0%, ${colors.accent}14 50%, transparent 70%)`,
        }}
      />
      {/* Subtle noise overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          opacity: 0.4,
        }}
      />
    </div>
  )
}
