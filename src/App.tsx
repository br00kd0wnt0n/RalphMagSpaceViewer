/**
 * App — orchestrates password gate, magazine list, switcher, and flipbook viewer.
 * All content fades in/out smoothly. Starfield remains constant.
 */
import { useEffect, useState, useCallback, type CSSProperties } from 'react'
import FlipbookViewer from './components/FlipbookViewer'
import LoadingState from './components/LoadingState'
import PasswordGate from './components/PasswordGate'
import MagazineSwitcher, { type MagazineInfo } from './components/MagazineSwitcher'
import Starfield from './components/Starfield'
import { usePdfLoader } from './hooks/usePdfLoader'

export default function App() {
  const pdf = usePdfLoader()
  const [magazines, setMagazines] = useState<MagazineInfo[]>([])
  const [currentIssue, setCurrentIssue] = useState<number>(1)
  // Fade state: 'in' = visible, 'out' = fading out before switching
  const [fade, setFade] = useState<'in' | 'out'>('in')

  // Fetch magazine list on mount
  useEffect(() => {
    fetch('/api/magazines')
      .then(res => res.json())
      .then((list: MagazineInfo[]) => {
        setMagazines(list)
        if (list.length > 0) {
          const latest = list[list.length - 1]
          setCurrentIssue(latest.issue)
          pdf.loadFromUrl(latest.pdfUrl, `Ralph ${latest.title}`)
        }
      })
      .catch(err => console.error('Failed to load magazine list:', err))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // When PDF becomes ready, fade in
  useEffect(() => {
    if (pdf.state === 'ready') {
      // Short delay to let the DOM settle before fading in
      const t = setTimeout(() => setFade('in'), 50)
      return () => clearTimeout(t)
    }
  }, [pdf.state])

  const handleSelectIssue = useCallback((issue: number) => {
    const mag = magazines.find(m => m.issue === issue)
    if (!mag) return

    // Fade out current content, then load new issue
    setFade('out')
    setTimeout(() => {
      setCurrentIssue(issue)
      pdf.loadFromUrl(mag.pdfUrl, `Ralph ${mag.title}`)
    }, 400) // matches CSS transition duration
  }, [magazines, pdf])

  const isLoading = pdf.state === 'loading'
  const isReady = pdf.state === 'ready'

  return (
    <PasswordGate>
      {/* Starfield is always visible, never fades */}
      <Starfield />

      {/* Loading state — fades + scales in/out */}
      <div style={{
        ...styles.layer,
        opacity: isLoading ? 1 : 0,
        transform: isLoading ? 'scale(1)' : 'scale(0.95)',
        pointerEvents: isLoading ? 'auto' : 'none',
      }}>
        <LoadingState
          progress={pdf.progress}
          pageCount={pdf.pageCount}
          fileName={pdf.fileName}
        />
      </div>

      {/* Magazine viewer + switcher — fades + scales in/out */}
      <div style={{
        ...styles.layer,
        opacity: (isReady && fade === 'in') ? 1 : 0,
        transform: (isReady && fade === 'in') ? 'scale(1)' : 'scale(1.03)',
        pointerEvents: isReady ? 'auto' : 'none',
      }}>
        {isReady && (
          <>
            <MagazineSwitcher
              magazines={magazines}
              currentIssue={currentIssue}
              onSelect={handleSelectIssue}
              visible={true}
            />
            <FlipbookViewer
              pages={pdf.pages}
              onBack={pdf.reset}
            />
          </>
        )}
      </div>
    </PasswordGate>
  )
}

const styles: Record<string, CSSProperties> = {
  layer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.4s ease-in-out, transform 0.5s ease-in-out',
    zIndex: 5,
  },
}
