/**
 * Hook: manages PDF file upload → page rendering pipeline.
 * Provides loading state, progress, rendered page data URLs, and error handling.
 */
import { useState, useCallback } from 'react'
import { renderPdfPages, type RenderedPage } from '../utils/pdf'

export type LoadingState = 'idle' | 'loading' | 'ready' | 'error'

export interface PdfLoaderResult {
  state: LoadingState
  pages: string[] // data URLs
  pageCount: number
  progress: number // 0-1
  error: string | null
  fileName: string | null
  loadFile: (file: File) => Promise<void>
  reset: () => void
}

export function usePdfLoader(): PdfLoaderResult {
  const [state, setState] = useState<LoadingState>('idle')
  const [pages, setPages] = useState<string[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const loadFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file!')
      setState('error')
      return
    }

    try {
      setState('loading')
      setError(null)
      setProgress(0)
      setPages([])
      setFileName(file.name.replace(/\.pdf$/i, ''))

      const buffer = await file.arrayBuffer()

      const rendered = await renderPdfPages(buffer, {
        scale: 1.5,
        priorityPages: 4,
        onPageRendered: (_page: RenderedPage, index: number, total: number) => {
          setPageCount(total)
          setProgress((index + 1) / total)
          // Update pages array progressively
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
      console.error('PDF load error:', err)
      setError(
        err instanceof Error
          ? `Oops! Couldn't read that PDF: ${err.message}`
          : 'Something went wrong reading that PDF. Try another one?'
      )
      setState('error')
    }
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setPages([])
    setPageCount(0)
    setProgress(0)
    setError(null)
    setFileName(null)
  }, [])

  return { state, pages, pageCount, progress, error, fileName, loadFile, reset }
}
