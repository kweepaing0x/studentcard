'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const path = usePathname()

  // Hide navbar on parent portal and quiz pages (mobile-first, no admin access)
  const isQuizPage = /^\/\d{4}$/.test(path)   // matches /0301, /0302, etc.
  const isParentPage = path === '/parent'
  if (isQuizPage || isParentPage) return null

  const today = new Date()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todaySlug = `/${mm}${dd}`

  return (
    <nav style={{
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      padding: '11px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
        Word<span style={{ color: 'var(--accent)' }}>Smart</span>
      </Link>
      <div style={{ display: 'flex', gap: 4 }}>
        <Link href={todaySlug} className={`nav-link ${path === todaySlug ? 'active' : ''}`}>✏️ Quiz</Link>
        <Link href="/parent"   className={`nav-link ${path === '/parent'   ? 'active' : ''}`}>👨‍👩‍👧 Parent</Link>
      </div>
    </nav>
  )
}
