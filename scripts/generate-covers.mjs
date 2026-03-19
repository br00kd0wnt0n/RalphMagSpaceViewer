/**
 * Generate cover thumbnail JPEGs from each Ralph Magazine PDF.
 * Renders page 1, splits the landscape spread, saves the left half as cover.
 * Run: node scripts/generate-covers.mjs
 */
import fs from 'fs'
import path from 'path'
import { createCanvas } from 'canvas'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

const PDF_DIR = process.argv[2] || './public'
const OUT_DIR = process.argv[3] || './public/covers'
const SCALE = 0.6 // low-res for thumbnails

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf')).sort()

for (const file of files) {
  const match = file.match(/Issue (\d+)/)
  if (!match) continue
  const issue = match[1]
  const outPath = path.join(OUT_DIR, `cover-${issue}.jpg`)

  if (fs.existsSync(outPath)) {
    console.log(`  skip: cover-${issue}.jpg already exists`)
    continue
  }

  console.log(`Processing: ${file}`)
  const data = new Uint8Array(fs.readFileSync(path.join(PDF_DIR, file)))
  const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: SCALE })

  const canvas = createCanvas(viewport.width, viewport.height)
  const ctx = canvas.getContext('2d')

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise

  // If landscape (spread), take the left half as cover
  let coverCanvas
  if (viewport.width > viewport.height) {
    const halfW = Math.floor(viewport.width / 2)
    coverCanvas = createCanvas(halfW, viewport.height)
    const coverCtx = coverCanvas.getContext('2d')
    coverCtx.drawImage(canvas, 0, 0, halfW, viewport.height, 0, 0, halfW, viewport.height)
  } else {
    coverCanvas = canvas
  }

  const jpegBuffer = coverCanvas.toBuffer('image/jpeg', { quality: 0.85 })
  fs.writeFileSync(outPath, jpegBuffer)
  console.log(`  → cover-${issue}.jpg (${(jpegBuffer.length / 1024).toFixed(0)}KB)`)
}

console.log('Done!')
