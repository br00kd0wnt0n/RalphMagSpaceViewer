/**
 * App — auto-loads the Ralph Magazine PDF and shows the flipbook viewer.
 */
import { useEffect } from 'react'
import FlipbookViewer from './components/FlipbookViewer'
import LoadingState from './components/LoadingState'
import Starfield from './components/Starfield'
import { usePdfLoader } from './hooks/usePdfLoader'

export default function App() {
  const pdf = usePdfLoader()

  // Auto-load the bundled Ralph Magazine PDF on mount
  useEffect(() => {
    if (pdf.state === 'idle') {
      fetch('/Ralph%20Magazine%201%20low%20res.pdf')
        .then(res => {
          if (!res.ok) throw new Error('PDF not found')
          return res.blob()
        })
        .then(blob => {
          const file = new File([blob], 'Ralph Magazine 1 low res.pdf', { type: 'application/pdf' })
          pdf.loadFile(file)
        })
        .catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (pdf.state === 'loading') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <Starfield />
        <LoadingState
          progress={pdf.progress}
          pageCount={pdf.pageCount}
          fileName={pdf.fileName}
        />
      </div>
    )
  }

  if (pdf.state === 'ready') {
    return (
      <>
        <Starfield />
        <FlipbookViewer
          pages={pdf.pages}
          onBack={pdf.reset}
        />
      </>
    )
  }

  // Idle / error — just black with stars
  return <div style={{ width: '100%', height: '100%', background: '#000' }}><Starfield /></div>
}
