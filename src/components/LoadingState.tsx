/**
 * LoadingState — crafty space-themed loading with planets orbiting around
 * the Ralph logo (behind and in front). Twinkling stars background.
 */
import { useEffect, useRef } from 'react'

interface Props {
  progress: number
  pageCount: number
  fileName: string | null
}

const PLANETS = [
  { body: '#e17b77', ring: '#d94f4f', spots: '#c0392b', size: 10, orbit: 52, speed: 0.0006, hasRing: false },
  { body: '#f9ca24', ring: '#f39c12', spots: '#e67e22', size: 13, orbit: 75, speed: -0.00038, hasRing: true },
  { body: '#4a90c4', ring: '#2f5fa3', spots: '#1a3a6b', size: 8, orbit: 98, speed: 0.00028, hasRing: false },
  { body: '#6ab04c', ring: '#27ae60', spots: '#1e8449', size: 11, orbit: 120, speed: -0.00045, hasRing: false },
  { body: '#e17bce', ring: '#9b59b6', spots: '#8e44ad', size: 7, orbit: 138, speed: 0.0002, hasRing: true },
]

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, alpha: number, type: 'cross' | 'dot'
) {
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
  if (type === 'cross') {
    ctx.fillRect(x - size, y - size * 0.3, size * 2, size * 0.6)
    ctx.fillRect(x - size * 0.3, y - size, size * 0.6, size * 2)
  } else {
    ctx.beginPath()
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  body: string, ring: string, spots: string,
  hasRing: boolean
) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath()
  ctx.ellipse(x + 2, y + 2, size, size * 0.95, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = body
  ctx.beginPath()
  ctx.ellipse(x, y, size, size * 0.95, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = spots
  ctx.lineWidth = 1.5
  ctx.setLineDash([3, 2])
  ctx.beginPath()
  ctx.ellipse(x, y, size, size * 0.95, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = spots
  ctx.globalAlpha = 0.25
  ctx.beginPath()
  ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + size * 0.2, y + size * 0.3, size * 0.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.ellipse(x - size * 0.25, y - size * 0.3, size * 0.35, size * 0.2, -0.5, 0, Math.PI * 2)
  ctx.fill()

  if (hasRing) {
    ctx.strokeStyle = ring
    ctx.lineWidth = 2.5
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.ellipse(x, y, size * 1.5, size * 0.35, 0.2, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

export default function LoadingState({ progress, pageCount }: Props) {
  const backCanvasRef = useRef<HTMLCanvasElement>(null)
  const frontCanvasRef = useRef<HTMLCanvasElement>(null)
  const pct = Math.round(progress * 100)
  const pagesReady = Math.round(progress * pageCount)

  useEffect(() => {
    const backCanvas = backCanvasRef.current!
    const frontCanvas = frontCanvasRef.current!
    const backCtx = backCanvas.getContext('2d')!
    const frontCtx = frontCanvas.getContext('2d')!
    const W = 340
    const H = 340
    backCanvas.width = W
    backCanvas.height = H
    frontCanvas.width = W
    frontCanvas.height = H
    let animId: number

    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.8 + 0.5,
      twinkleSpeed: Math.random() * 0.004 + 0.002,
      phase: Math.random() * Math.PI * 2,
      type: (Math.random() > 0.6 ? 'cross' : 'dot') as 'cross' | 'dot',
    }))

    const planets = PLANETS.map((p, i) => ({
      ...p,
      phase: (i / PLANETS.length) * Math.PI * 2,
    }))

    const cx = W / 2
    const cy = H / 2
    const margin = 22

    function draw(now: number) {
      backCtx.clearRect(0, 0, W, H)
      frontCtx.clearRect(0, 0, W, H)

      // Stars on back layer
      for (const s of stars) {
        const twinkle = Math.sin(now * s.twinkleSpeed + s.phase)
        drawStar(backCtx, s.x, s.y, s.size, Math.max(0.05, 0.3 + twinkle * 0.3), s.type)
      }

      // Orbit paths on back layer
      for (const p of planets) {
        backCtx.strokeStyle = 'rgba(255,255,255,0.05)'
        backCtx.lineWidth = 0.5
        backCtx.setLineDash([4, 6])
        backCtx.beginPath()
        backCtx.ellipse(cx, cy, p.orbit, p.orbit * 0.7, 0, 0, Math.PI * 2)
        backCtx.stroke()
        backCtx.setLineDash([])
      }

      // Draw planets — back half of orbit on back canvas, front half on front canvas
      for (const p of planets) {
        const angle = now * p.speed + p.phase
        const sinA = Math.sin(angle)
        let px = cx + Math.cos(angle) * p.orbit
        let py = cy + sinA * p.orbit * 0.7

        // Clamp
        const s = p.size * (p.hasRing ? 1.6 : 1.1)
        px = Math.max(margin + s, Math.min(W - margin - s, px))
        py = Math.max(margin + s, Math.min(H - margin - s, py))

        // sinA > 0 means planet is on the bottom/front half of the ellipse
        const ctx = sinA > 0 ? frontCtx : backCtx
        drawPlanet(ctx, px, py, p.size, p.body, p.ring, p.spots, p.hasRing)
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={styles.wrapper}>
      <div style={styles.canvasWrap}>
        {/* Back layer: stars + planets behind the logo */}
        <canvas ref={backCanvasRef} style={styles.canvasBack} />
        {/* Logo in the center */}
        <img src="/ralph-logo.png" alt="Ralph" style={styles.logo} />
        {/* Front layer: planets in front of the logo */}
        <canvas ref={frontCanvasRef} style={styles.canvasFront} />
      </div>
      <div style={styles.progressRing}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="30" cy="30" r="26"
            fill="none"
            stroke="#f9ca24"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${pct * 1.63} 163`}
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dasharray 0.3s ease-out' }}
          />
        </svg>
        <span style={styles.pctText}>{pct}%</span>
      </div>
      <div style={styles.statusText}>
        {pagesReady} of {pageCount || '?'} pages
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    zIndex: 5,
  },
  canvasWrap: {
    position: 'relative',
    width: 340,
    height: 340,
  },
  canvasBack: {
    position: 'absolute',
    inset: 0,
    width: 340,
    height: 340,
  },
  canvasFront: {
    position: 'absolute',
    inset: 0,
    width: 340,
    height: 340,
    pointerEvents: 'none',
  },
  logo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 80,
    height: 'auto',
    filter: 'drop-shadow(0 0 12px rgba(255, 0, 128, 0.4))',
    zIndex: 1,
  },
  progressRing: {
    position: 'relative',
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: {
    position: 'absolute',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: '#f9ca24',
    fontWeight: 700,
  },
  statusText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)',
  },
}
