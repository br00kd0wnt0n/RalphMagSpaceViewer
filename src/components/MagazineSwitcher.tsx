/**
 * MagazineSwitcher — floating cover thumbnails on left/right sides.
 * Click to switch the active magazine issue.
 */
import { type CSSProperties } from 'react'

export interface MagazineInfo {
  issue: number
  title: string
  coverUrl: string
  pdfUrl: string
}

interface Props {
  magazines: MagazineInfo[]
  currentIssue: number
  onSelect: (issue: number) => void
  visible: boolean // hide during loading
}

export default function MagazineSwitcher({ magazines, currentIssue, onSelect, visible }: Props) {
  // Hide on mobile — not enough space for side covers
  if (!visible || magazines.length <= 1 || window.innerWidth < 600) return null

  // Split other issues into left and right columns
  const others = magazines.filter(m => m.issue !== currentIssue)
  const half = Math.ceil(others.length / 2)
  const left = others.slice(0, half)
  const right = others.slice(half)

  return (
    <>
      <div style={{ ...styles.column, left: 16 }}>
        {left.map((m, i) => (
          <CoverThumb
            key={m.issue}
            magazine={m}
            onClick={() => onSelect(m.issue)}
            rotation={-3 + i * 2}
            delay={i * 0.15}
          />
        ))}
      </div>
      <div style={{ ...styles.column, right: 16 }}>
        {right.map((m, i) => (
          <CoverThumb
            key={m.issue}
            magazine={m}
            onClick={() => onSelect(m.issue)}
            rotation={3 - i * 2}
            delay={i * 0.15 + 0.3}
          />
        ))}
      </div>
    </>
  )
}

function CoverThumb({
  magazine,
  onClick,
  rotation,
  delay,
}: {
  magazine: MagazineInfo
  onClick: () => void
  rotation: number
  delay: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.thumb,
        transform: `rotate(${rotation}deg)`,
        // Each thumb floats with a unique duration and staggers its appearance
        animation: `slide-up 0.5s ease-out ${delay}s backwards, thumb-float ${6 + delay * 3}s ease-in-out ${delay}s infinite`,
        transitionDelay: `${delay * 0.8}s`,
      }}
      title={`Ralph ${magazine.title}`}
    >
      <img
        src={magazine.coverUrl}
        alt={`Ralph ${magazine.title}`}
        style={styles.thumbImg}
        loading="lazy"
      />
      <div style={styles.issueLabel}>#{magazine.issue}</div>
    </button>
  )
}

const styles: Record<string, CSSProperties> = {
  column: {
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    zIndex: 10,
    pointerEvents: 'auto',
  },
  thumb: {
    position: 'relative',
    width: 64,
    height: 88,
    background: 'none',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '3px',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    padding: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  issueLabel: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    color: '#fff',
    background: 'rgba(0,0,0,0.6)',
    padding: '1px 4px',
    borderRadius: '2px',
  },
}
