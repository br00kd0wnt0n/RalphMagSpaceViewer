/**
 * Starfield — subtle twinkling stars and occasional shooting stars.
 * Pure CSS/canvas, sits behind the magazine.
 */
import { useEffect, useRef } from 'react'

const STAR_COUNT = 120
const SHOOTING_STAR_INTERVAL = 8000 // ms between shooting stars (average)

interface Star {
  x: number
  y: number
  size: number
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
}

interface ShootingStar {
  x: number
  y: number
  angle: number
  speed: number
  length: number
  opacity: number
  life: number
  maxLife: number
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animId: number
    let lastShootingStarTime = 0

    // Size canvas to window
    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate stars
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.3,
      baseOpacity: Math.random() * 0.4 + 0.15,
      twinkleSpeed: Math.random() * 0.003 + 0.001,
      twinklePhase: Math.random() * Math.PI * 2,
    }))

    const shootingStars: ShootingStar[] = []

    function spawnShootingStar(now: number) {
      shootingStars.push({
        x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        y: Math.random() * canvas.height * 0.4,
        angle: Math.PI * 0.15 + Math.random() * 0.3, // roughly diagonal
        speed: 4 + Math.random() * 4,
        length: 60 + Math.random() * 80,
        opacity: 0.6 + Math.random() * 0.3,
        life: 0,
        maxLife: 40 + Math.random() * 30,
      })
      lastShootingStarTime = now
    }

    function draw(now: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw twinkling stars
      for (const star of stars) {
        const twinkle = Math.sin(now * star.twinkleSpeed + star.twinklePhase)
        const opacity = star.baseOpacity + twinkle * star.baseOpacity * 0.5
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`
        ctx.beginPath()
        ctx.arc(star.x * canvas.width, star.y * canvas.height, star.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Occasionally spawn a shooting star
      if (now - lastShootingStarTime > SHOOTING_STAR_INTERVAL + Math.random() * 6000) {
        spawnShootingStar(now)
      }

      // Draw and update shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        s.life++
        s.x += Math.cos(s.angle) * s.speed
        s.y += Math.sin(s.angle) * s.speed

        const progress = s.life / s.maxLife
        const fadeIn = Math.min(progress * 4, 1)
        const fadeOut = Math.max(1 - progress, 0)
        const alpha = s.opacity * fadeIn * fadeOut

        // Draw the streak as a gradient line
        const tailX = s.x - Math.cos(s.angle) * s.length * fadeOut
        const tailY = s.y - Math.sin(s.angle) * s.length * fadeOut

        const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`)
        gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(s.x, s.y)
        ctx.stroke()

        // Bright head
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.5})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2)
        ctx.fill()

        if (s.life >= s.maxLife) {
          shootingStars.splice(i, 1)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}
