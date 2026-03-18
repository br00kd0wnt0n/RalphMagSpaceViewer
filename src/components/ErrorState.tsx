/**
 * ErrorState — a friendly, paper-crafty error message.
 */
import type { CSSProperties } from 'react'

interface Props {
  message: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.icon}>🫠</div>
        <h2 style={styles.title}>Paper Jam!</h2>
        <p style={styles.message}>{message}</p>
        <button
          style={styles.button}
          onClick={onRetry}
          onMouseEnter={e => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'rotate(-1deg) scale(1)' }}
        >
          ↩ Try Again
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pop-in 0.4s ease-out',
  },
  card: {
    background: 'var(--cream)',
    padding: '32px 40px',
    borderRadius: '6px',
    boxShadow: 'var(--shadow-heavy)',
    textAlign: 'center',
    maxWidth: 380,
    border: '2px solid var(--red-tape)',
    transform: 'rotate(0.5deg)',
  },
  icon: {
    fontSize: '48px',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '26px',
    fontWeight: 700,
    color: 'var(--red-tape)',
    margin: '0 0 8px',
  },
  message: {
    fontFamily: 'var(--font-hand)',
    fontSize: '16px',
    color: 'var(--ink-light)',
    marginBottom: 20,
    lineHeight: 1.4,
  },
  button: {
    background: 'var(--red-tape)',
    color: '#fff',
    border: 'none',
    fontFamily: 'var(--font-hand)',
    fontSize: '18px',
    padding: '10px 28px',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    transform: 'rotate(-1deg)',
    transition: 'all 0.2s ease',
  },
}
