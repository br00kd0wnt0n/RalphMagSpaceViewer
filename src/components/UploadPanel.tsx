/**
 * UploadPanel — the charming landing screen with drag-and-drop PDF upload.
 * Designed to feel like a handmade invitation, not a corporate file picker.
 */
import { useState, useRef, useCallback, type CSSProperties, type DragEvent } from 'react'

interface Props {
  onFileSelected: (file: File) => void
  onDemoMode: () => void
}

export default function UploadPanel({ onFileSelected, onDemoMode }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragOut = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }, [onFileSelected])

  const handleClick = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div style={styles.wrapper}>
      {/* Title card */}
      <div style={styles.titleCard}>
        <div style={styles.titleSticker}>✂️ ZINE VIEWER</div>
        <h1 style={styles.title}>Your Magazine,<br />Brought to Life</h1>
        <p style={styles.subtitle}>
          Drop in a PDF and flip through it like a handmade paper magazine.
        </p>
      </div>

      {/* Upload zone */}
      <div
        style={{
          ...styles.dropZone,
          ...(isDragging ? styles.dropZoneActive : {}),
          ...(isHovering ? styles.dropZoneHover : {}),
        }}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={styles.dropIcon}>
          {isDragging ? '📬' : '📄'}
        </div>
        <div style={styles.dropText}>
          {isDragging ? 'Let it go!' : 'Drop your PDF here'}
        </div>
        <div style={styles.dropHint}>
          or click to browse your files
        </div>

        {/* Corner tapes on the drop zone */}
        <div style={{ ...styles.cornerTape, top: -6, left: -6, transform: 'rotate(-45deg)' }} />
        <div style={{ ...styles.cornerTape, top: -6, right: -6, transform: 'rotate(45deg)' }} />
        <div style={{ ...styles.cornerTape, bottom: -6, left: -6, transform: 'rotate(45deg)' }} />
        <div style={{ ...styles.cornerTape, bottom: -6, right: -6, transform: 'rotate(-45deg)' }} />
      </div>

      {/* Demo mode link */}
      <button
        style={styles.demoButton}
        onClick={onDemoMode}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(249,202,36,0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        ✨ Or try the demo with sample pages
      </button>

      {/* Decorative label sticker */}
      <div style={styles.stickerLabel}>
        NO SIGN-UP · NO SERVER · JUST FUN
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    animation: 'slide-up 0.6s ease-out',
    maxWidth: 500,
    padding: '20px',
  },
  titleCard: {
    textAlign: 'center',
    padding: '24px 32px 20px',
    background: 'var(--cream)',
    borderRadius: '4px',
    boxShadow: 'var(--shadow-paper)',
    position: 'relative',
    transform: 'rotate(-0.5deg)',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  titleSticker: {
    display: 'inline-block',
    background: 'var(--red-tape)',
    color: '#fff',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    padding: '4px 14px',
    borderRadius: '2px',
    marginBottom: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transform: 'rotate(-1deg)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: 1.1,
    color: 'var(--ink)',
    margin: '0 0 8px',
  },
  subtitle: {
    fontFamily: 'var(--font-hand)',
    fontSize: '17px',
    color: 'var(--ink-light)',
    lineHeight: 1.4,
  },
  dropZone: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    padding: '40px 24px',
    background: 'var(--paper-white)',
    border: '3px dashed var(--kraft)',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    boxShadow: 'var(--shadow-paper)',
    transform: 'rotate(0.3deg)',
  },
  dropZoneActive: {
    borderColor: 'var(--green-tab)',
    background: '#f0f9e8',
    transform: 'rotate(0deg) scale(1.02)',
    boxShadow: 'var(--shadow-heavy)',
  },
  dropZoneHover: {
    borderColor: 'var(--blue-sticker)',
    boxShadow: 'var(--shadow-heavy)',
    transform: 'rotate(0deg) scale(1.01)',
  },
  dropIcon: {
    fontSize: '48px',
    marginBottom: 12,
    filter: 'drop-shadow(2px 3px 2px rgba(0,0,0,0.15))',
    animation: 'wiggle 2s ease-in-out infinite',
  },
  dropText: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--ink)',
    marginBottom: 6,
  },
  dropHint: {
    fontFamily: 'var(--font-hand)',
    fontSize: '14px',
    color: 'var(--ink-light)',
  },
  cornerTape: {
    position: 'absolute',
    width: 30,
    height: 12,
    backgroundColor: 'rgba(249,202,36,0.55)',
    borderRadius: '1px',
    pointerEvents: 'none',
  },
  demoButton: {
    background: 'transparent',
    border: '2px dashed rgba(255,255,255,0.25)',
    color: 'var(--cream)',
    fontFamily: 'var(--font-hand)',
    fontSize: '16px',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  stickerLabel: {
    display: 'inline-block',
    background: 'var(--yellow-note)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    padding: '5px 14px',
    borderRadius: '2px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    transform: 'rotate(2deg)',
  },
}
