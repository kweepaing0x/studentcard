'use client'

interface RingProps {
  pct: number
  size?: number
  color?: string
  label?: string
  sub?: string
}

export function Ring({ pct, size = 110, color = 'var(--accent)', label, sub }: RingProps) {
  const r = (size - 14) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1A1D2E" strokeWidth={7} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.1,.5,.5,1)' }} />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'Syne', sans-serif" }}>
          {label ?? `${pct}%`}
        </div>
        {sub && <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}
