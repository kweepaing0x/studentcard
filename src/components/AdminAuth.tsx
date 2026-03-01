'use client'
import { useState, useEffect } from 'react'

// Change this password to whatever you want
const ADMIN_PASSWORD = 'wordsmart2026'

export function useAdminAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null) // null = loading

  useEffect(() => {
    const ok = sessionStorage.getItem('admin_authed') === '1'
    setAuthed(ok)
  }, [])

  const login = (pw: string): boolean => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', '1')
      setAuthed(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('admin_authed')
    setAuthed(false)
  }

  return { authed, login, logout }
}

export function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const { authed, login, logout } = useAdminAuth()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [show, setShow] = useState(false)

  // Still loading from sessionStorage
  if (authed === null) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <span className="spin" style={{ fontSize: 28, color: 'var(--sub)' }}>⟳</span>
    </div>
  )

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent), #4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 34, margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(124,92,252,.35)',
          }}>⚙️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>Admin Panel</h1>
          <p style={{ color: 'var(--sub)', fontSize: 14, marginTop: 6 }}>Enter password to continue</p>
        </div>

        <div className="card">
          {err && (
            <div className="err-box" style={{ marginBottom: 16 }}>
              Incorrect password. Try again.
            </div>
          )}
          <label>Admin Password</label>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input
              className="input"
              type={show ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={pw}
              onChange={e => { setPw(e.target.value); setErr(false) }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (!login(pw)) setErr(true)
                }
              }}
              style={{ paddingRight: 44 }}
              autoFocus
            />
            <button
              onClick={() => setShow(s => !s)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--sub)' }}
            >
              {show ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            className="btn btn-p"
            style={{ width: '100%' }}
            onClick={() => { if (!login(pw)) setErr(true) }}
            disabled={!pw}
          >
            Login →
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--sub)', fontSize: 12 }}>
          Students go to <a href="/parent" style={{ color: 'var(--accent-lt)' }}>/parent</a> to view progress
        </p>
      </div>
    </div>
  )

  return (
    <>
      {children}
      {/* Logout button floating bottom-right */}
      <button
        onClick={logout}
        style={{
          position: 'fixed', bottom: 20, right: 20,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '8px 14px',
          fontSize: 12, fontWeight: 600, color: 'var(--sub)',
          cursor: 'pointer', zIndex: 99,
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,.3)',
          transition: 'all .18s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,.4)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--sub)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)' }}
      >
        🔒 Logout
      </button>
    </>
  )
}
