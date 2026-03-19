/**
 * Express server — serves the built frontend + PDF magazines from a configurable directory.
 * In production (Railway), PDFs live on a mounted volume at /data/magazines.
 * Locally, they're served from ./public.
 */
import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3000
const PDF_DIR = process.env.PDF_DIR || path.join(__dirname, 'public')
const COVER_DIR = process.env.COVER_DIR || path.join(PDF_DIR, 'covers')

// Load magazine metadata
const magazines = JSON.parse(fs.readFileSync(path.join(__dirname, 'magazines.json'), 'utf-8'))

// API: list all magazines
app.get('/api/magazines', (_req, res) => {
  const list = magazines.map(m => ({
    issue: m.issue,
    title: m.title,
    coverUrl: `/api/magazines/${m.issue}/cover`,
    pdfUrl: `/api/magazines/${m.issue}/pdf`,
  }))
  res.json(list)
})

// API: serve a cover thumbnail
app.get('/api/magazines/:issue/cover', (req, res) => {
  const issue = parseInt(String(req.params.issue))
  const mag = magazines.find(m => m.issue === issue)
  if (!mag) return res.status(404).json({ error: 'Issue not found' })

  const coverPath = path.join(COVER_DIR, mag.cover)
  if (!fs.existsSync(coverPath)) return res.status(404).json({ error: 'Cover not found' })

  res.setHeader('Cache-Control', 'public, max-age=86400')
  res.sendFile(coverPath)
})

// API: stream a PDF
app.get('/api/magazines/:issue/pdf', (req, res) => {
  const issue = parseInt(String(req.params.issue))
  const mag = magazines.find(m => m.issue === issue)
  if (!mag) return res.status(404).json({ error: 'Issue not found' })

  const pdfPath = path.join(PDF_DIR, mag.pdf)
  if (!fs.existsSync(pdfPath)) return res.status(404).json({ error: 'PDF not found' })

  const stat = fs.statSync(pdfPath)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Length', stat.size)
  res.setHeader('Cache-Control', 'public, max-age=86400')

  const stream = fs.createReadStream(pdfPath)
  stream.pipe(res)
})

// Serve the built frontend (production)
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  // SPA fallback — serve index.html for any non-API route
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`PDF directory: ${PDF_DIR}`)
  console.log(`Cover directory: ${COVER_DIR}`)
})
