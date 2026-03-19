/**
 * PasswordGate — simple client-side password screen.
 * Password is configurable via VITE_PASSWORD env var (defaults to 'ralph').
 * Persists auth in sessionStorage.
 */
import { useState, useEffect, type CSSProperties } from 'react'

const PASSWORD = import.meta.env.VITE_PASSWORD || 'ralphworldftw2026!'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('ralph_auth') === 'true') {
      setAuthed(true)
    }
  }, [])

  if (authed) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem('ralph_auth', 'true')
      setAuthed(true)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setInput('')
    }
  }

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <img src="/ralph-logo.png" alt="Ralph" style={styles.logo} />
        <input
          type="password"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter password"
          autoFocus
          style={{
            ...styles.input,
            animation: shake ? 'wiggle 0.3s ease-in-out' : 'none',
          }}
        />
        <button type="submit" style={styles.button}>Enter</button>
      </form>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  logo: {
    width: 120,
    height: 'auto',
    filter: 'drop-shadow(0 0 20px rgba(255, 0, 128, 0.3))',
    marginBottom: 10,
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#fff',
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    padding: '12px 20px',
    borderRadius: '6px',
    width: 240,
    textAlign: 'center',
    outline: 'none',
  },
  button: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#aaa',
    fontFamily: 'var(--font-hand)',
    fontSize: '16px',
    padding: '10px 32px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}
