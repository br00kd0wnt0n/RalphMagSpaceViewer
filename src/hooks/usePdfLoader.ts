/**
 * Hook: manages PDF loading → page rendering pipeline.
 * Supports loading from URL (for API-served PDFs) or File object.
 */
import { useState, useCallback, useRef } from 'react'
import { renderPdfPages, type RenderedPage } from '../utils/pdf'

export type LoadingState = 'idle' | 'loading' | 'ready' | 'error'

export interface PdfLoaderResult {
  state: LoadingState
  pages: string[]
  pageCount: number
  progress: number
  error: string | null
  fileName: string | null
  loadFromUrl: (url: string, name?: string) => Promise<void>
  loadFile: (file: File) => Promise<void>
  reset: () => void
}

// Detect mobile for lower render scale
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export function usePdfLoader(): PdfLoaderResult {
  const [state, setState] = useState<LoadingState>('idle')
  const [pages, setPages] = useState<string[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const renderBuffer = useCallback(async (buffer: ArrayBuffer, name: string) => {
    try {
      setState('loading')
      setError(null)
      setProgress(0)
      setPages([])
      setFileName(name)

      const rendered = await renderPdfPages(buffer, {
        scale: isMobile ? 1.0 : 1.5,
        priorityPages: 4,
        onPageRendered: (_page: RenderedPage, index: number, total: number) => {
          setPageCount(total)
          setProgress((index + 1) / total)
          setPages(prev => {
            const next = [...prev]
            next[index] = _page.dataUrl
            return next
          })
        },
      })

      setPages(rendered.map(p => p.dataUrl))
      setPageCount(rendered.length)
      setState('ready')
    } catch (err) {
      console.error('PDF render error:', err)
      setError(
        err instanceof Error
          ? `Couldn't read that PDF: ${err.message}`
          : 'Something went wrong reading that PDF.'
      )
      setState('error')
    }
  }, [])

  const loadFromUrl = useCallback(async (url: string, name?: string) => {
    // Abort any in-progress load
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setState('loading')
      setError(null)
      setProgress(0)
      setPages([])
      setFileName(name || 'Magazine')

      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = await res.arrayBuffer()

      if (controller.signal.aborted) return
      await renderBuffer(buffer, name || 'Magazine')
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      console.error('PDF fetch error:', err)
      setError('Failed to load the magazine. Try again?')
      setState('error')
    }
  }, [renderBuffer])

  const loadFile = useCallback(async (file: File) => {
    const buffer = await file.arrayBuffer()
    await renderBuffer(buffer, file.name.replace(/\.pdf$/i, ''))
  }, [renderBuffer])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState('idle')
    setPages([])
    setPageCount(0)
    setProgress(0)
    setError(null)
    setFileName(null)
  }, [])

  return { state, pages, pageCount, progress, error, fileName, loadFromUrl, loadFile, reset }
}
