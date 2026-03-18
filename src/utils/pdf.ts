/**
 * PDF rendering utility — uses pdf.js to convert PDF pages into canvas data URLs.
 * Landscape pages (spreads) are automatically split into left/right halves.
 * Pages render progressively: first few immediately, rest in background.
 */
import * as pdfjsLib from 'pdfjs-dist'

// Point pdf.js to its worker (bundled with the package)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export interface RenderedPage {
  dataUrl: string
  width: number
  height: number
  pageNumber: number
}

/**
 * Split a landscape canvas into left and right halves, returning two data URLs.
 * Portrait canvases are returned as-is (single entry).
 */
function splitIfSpread(
  canvas: HTMLCanvasElement,
  pageNum: number,
): RenderedPage[] {
  const w = canvas.width
  const h = canvas.height

  // Portrait or square → not a spread, return as single page
  if (w <= h) {
    return [{
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width: w,
      height: h,
      pageNumber: pageNum,
    }]
  }

  // Landscape → split into left and right halves
  const halfW = Math.floor(w / 2)

  const leftCanvas = document.createElement('canvas')
  leftCanvas.width = halfW
  leftCanvas.height = h
  const leftCtx = leftCanvas.getContext('2d')!
  leftCtx.drawImage(canvas, 0, 0, halfW, h, 0, 0, halfW, h)

  const rightCanvas = document.createElement('canvas')
  rightCanvas.width = halfW
  rightCanvas.height = h
  const rightCtx = rightCanvas.getContext('2d')!
  rightCtx.drawImage(canvas, halfW, 0, halfW, h, 0, 0, halfW, h)

  const left: RenderedPage = {
    dataUrl: leftCanvas.toDataURL('image/jpeg', 0.92),
    width: halfW,
    height: h,
    pageNumber: pageNum,
  }
  const right: RenderedPage = {
    dataUrl: rightCanvas.toDataURL('image/jpeg', 0.92),
    width: halfW,
    height: h,
    pageNumber: pageNum,
  }

  // Free memory
  leftCanvas.width = 0
  leftCanvas.height = 0
  rightCanvas.width = 0
  rightCanvas.height = 0

  return [left, right]
}

/**
 * Load a PDF from an ArrayBuffer and render all pages as images.
 * Landscape pages are split into left/right halves (spread detection).
 * Calls `onPageRendered` as each output page finishes so the UI updates progressively.
 */
export async function renderPdfPages(
  data: ArrayBuffer,
  opts: {
    scale?: number
    onPageRendered?: (page: RenderedPage, index: number, total: number) => void
    priorityPages?: number // render this many PDF pages first before yielding
  } = {},
): Promise<RenderedPage[]> {
  const scale = opts.scale ?? 1.5
  const priorityCount = opts.priorityPages ?? 4

  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pdfPageCount = pdf.numPages
  const allPages: RenderedPage[] = []

  // First pass: quickly estimate total output pages (assume all are spreads for progress)
  // We'll update with real count as we go
  let estimatedTotal = pdfPageCount * 2

  // Render a single PDF page to canvas, split if spread
  async function renderPdfPage(pageNum: number): Promise<RenderedPage[]> {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise

    const results = splitIfSpread(canvas, pageNum)

    // Free source canvas
    canvas.width = 0
    canvas.height = 0

    return results
  }

  // Render all PDF pages, splitting spreads
  for (let i = 1; i <= pdfPageCount; i++) {
    const results = await renderPdfPage(i)

    for (const page of results) {
      const idx = allPages.length
      allPages.push(page)
      opts.onPageRendered?.(page, idx, estimatedTotal)
    }

    // After first few PDF pages, refine the estimate
    if (i === priorityCount) {
      const avgPagesPerPdf = allPages.length / i
      estimatedTotal = Math.round(avgPagesPerPdf * pdfPageCount)
    }
  }

  return allPages
}
