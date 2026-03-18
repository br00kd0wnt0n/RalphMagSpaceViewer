/**
 * Generates colorful placeholder "zine pages" for demo mode when no PDF is uploaded.
 * Each page is a unique hand-drawn-feeling design rendered to canvas.
 */

const PALETTE = [
  { bg: '#f9f5ec', accent: '#d94f4f', label: 'Cherry Red' },
  { bg: '#e8f4f0', accent: '#2d9c6f', label: 'Forest Green' },
  { bg: '#fef3e2', accent: '#e67e22', label: 'Tangerine' },
  { bg: '#f0e6f6', accent: '#8e44ad', label: 'Plum' },
  { bg: '#e8f0fe', accent: '#2f5fa3', label: 'Denim Blue' },
  { bg: '#fce4ec', accent: '#c62828', label: 'Rose' },
  { bg: '#f5f5dc', accent: '#5d4037', label: 'Mocha' },
  { bg: '#e0f7fa', accent: '#00838f', label: 'Teal' },
]

function drawDots(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.globalAlpha = 0.08
  for (let x = 0; x < w; x += 12) {
    for (let y = 0; y < h; y += 12) {
      if (Math.random() > 0.5) {
        ctx.beginPath()
        ctx.arc(x + Math.random() * 4, y + Math.random() * 4, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  ctx.globalAlpha = 1
}

function drawScribble(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 4
    const r = size * (0.3 + 0.7 * (i / 20))
    const px = x + Math.cos(angle) * r + (Math.random() - 0.5) * 4
    const py = y + Math.sin(angle) * r + (Math.random() - 0.5) * 4
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}

export function generatePlaceholderPages(count = 8, width = 600, height = 800): string[] {
  return Array.from({ length: count }, (_, i) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    const scheme = PALETTE[i % PALETTE.length]

    // Background
    ctx.fillStyle = scheme.bg
    ctx.fillRect(0, 0, width, height)

    // Halftone dots
    drawDots(ctx, width, height, scheme.accent)

    if (i === 0) {
      // Cover page
      // Big title block
      ctx.fillStyle = scheme.accent
      ctx.fillRect(width * 0.1, height * 0.2, width * 0.8, height * 0.15)
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${width * 0.08}px 'Patrick Hand', cursive`
      ctx.textAlign = 'center'
      ctx.fillText('YOUR ZINE', width / 2, height * 0.3)
      ctx.font = `${width * 0.035}px 'Patrick Hand', cursive`
      ctx.fillText('a handmade magazine', width / 2, height * 0.34)

      // Decorative elements
      drawScribble(ctx, width * 0.2, height * 0.55, 60, scheme.accent)
      drawScribble(ctx, width * 0.7, height * 0.6, 45, scheme.accent)

      // Issue info
      ctx.fillStyle = scheme.accent
      ctx.globalAlpha = 0.7
      ctx.font = `${width * 0.03}px 'Courier Prime', monospace`
      ctx.fillText('ISSUE #1 — DEMO EDITION', width / 2, height * 0.88)
      ctx.globalAlpha = 1

      // Star sticker
      ctx.fillStyle = '#f9ca24'
      ctx.beginPath()
      const cx = width * 0.78, cy = height * 0.18
      for (let j = 0; j < 10; j++) {
        const angle = (j * Math.PI) / 5 - Math.PI / 2
        const r = j % 2 === 0 ? 30 : 14
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
      }
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = scheme.accent
      ctx.font = `bold ${10}px sans-serif`
      ctx.fillText('NEW!', cx, cy + 4)
    } else {
      // Inner pages
      // Page border lines
      ctx.strokeStyle = scheme.accent
      ctx.globalAlpha = 0.15
      ctx.lineWidth = 1
      ctx.strokeRect(width * 0.08, height * 0.06, width * 0.84, height * 0.88)
      ctx.globalAlpha = 1

      // "Content" lines (like text placeholders)
      ctx.fillStyle = scheme.accent
      ctx.globalAlpha = 0.12
      const lineY = height * 0.15
      for (let l = 0; l < 12; l++) {
        const lw = width * (0.4 + Math.random() * 0.35)
        const lx = width * 0.12
        ctx.fillRect(lx, lineY + l * (height * 0.05), lw, 3)
      }
      ctx.globalAlpha = 1

      // "Image" placeholder block
      const imgX = width * 0.15
      const imgY = height * 0.5
      const imgW = width * 0.7
      const imgH = height * 0.25
      ctx.fillStyle = scheme.accent
      ctx.globalAlpha = 0.07
      ctx.fillRect(imgX, imgY, imgW, imgH)
      ctx.globalAlpha = 0.3
      ctx.strokeStyle = scheme.accent
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.strokeRect(imgX, imgY, imgW, imgH)
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // Cross lines in image area
      ctx.globalAlpha = 0.15
      ctx.beginPath()
      ctx.moveTo(imgX, imgY)
      ctx.lineTo(imgX + imgW, imgY + imgH)
      ctx.moveTo(imgX + imgW, imgY)
      ctx.lineTo(imgX, imgY + imgH)
      ctx.stroke()
      ctx.globalAlpha = 1

      // Page label
      ctx.fillStyle = scheme.accent
      ctx.globalAlpha = 0.5
      ctx.font = `${width * 0.025}px 'Courier Prime', monospace`
      ctx.textAlign = 'center'
      ctx.fillText(`— page ${i + 1} —`, width / 2, height * 0.93)
      ctx.globalAlpha = 1

      // Random decorative scribble
      if (Math.random() > 0.5) {
        drawScribble(ctx, width * (0.7 + Math.random() * 0.15), height * 0.1, 25, scheme.accent)
      }
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    canvas.width = 0
    canvas.height = 0
    return dataUrl
  })
}
