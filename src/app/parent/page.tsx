'use client'
import { useState, useCallback } from 'react'
import { supabase, type Student } from '@/lib/supabase'
import { Ring } from '@/components/Ring'
import { Avatar } from '@/components/Avatar'

type Phase = 'login' | 'profile'
type Tab = 'overview' | 'tests' | 'words'

interface SubRow {
  form_date: string
  score: number
  total: number
  submitted_at: string
}

export default function ParentPage() {
  const [phase, setPhase] = useState<Phase>('login')
  const [sid, setSid] = useState('')
  const [pw, setPw] = useState('')
  const [student, setStudent] = useState<Student | null>(null)
  const [subs, setSubs] = useState<SubRow[]>([])
  const [wordDates, setWordDates] = useState<string[]>([])
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  const login = useCallback(async () => {
    setBusy(true); setErr('')
    const { data: students } = await supabase
      .from('students').select('*').eq('id', sid).eq('parent_password', pw)

    if (!students?.length) {
      setErr('Incorrect Student ID or password.'); setBusy(false); return
    }
    const s = students[0] as Student

    const [{ data: subData }, { data: wData }] = await Promise.all([
      supabase.from('submissions').select('form_date,score,total,submitted_at').eq('student_id', sid).order('form_date', { ascending: false }),
      supabase.from('daily_words').select('word_date').order('word_date', { ascending: false }),
    ])

    const uniqueDates = [...new Set((wData || []).map((w: { word_date: string }) => w.word_date))]
    setStudent(s)
    setSubs((subData || []) as SubRow[])
    setWordDates(uniqueDates)
    setPhase('profile')
    setBusy(false)
  }, [sid, pw])

  const logout = () => {
    setPhase('login'); setStudent(null); setSid(''); setPw(''); setTab('overview')
  }

  const learnedWords = wordDates.length * 5
  const totalCorrect = subs.reduce((a, x) => a + x.score, 0)
  const totalPossible = subs.reduce((a, x) => a + x.total, 0)
  const pct = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0
  const scoreColor = pct >= 80 ? 'var(--emerald)' : pct >= 60 ? 'var(--gold)' : 'var(--danger)'

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 20px' }} className="au">

      {/* ── LOGIN ── */}
      {phase === 'login' && (
        <div className="card" style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 44 }}>👨‍👩‍👧</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>Parent Portal</h1>
            <p style={{ color: 'var(--sub)', fontSize: 13, marginTop: 4 }}>Login to view your child&apos;s progress</p>
          </div>
          {err && <div className="err-box">{err}</div>}
          <div style={{ marginBottom: 14 }}>
            <label>Student ID</label>
            <input className="input" placeholder="e.g. STU-001" value={sid} onChange={e => setSid(e.target.value.toUpperCase())} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label>Parent Password</label>
            <input className="input" type="password" placeholder="••••••••" value={pw}
              onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          <button className="btn btn-g" style={{ width: '100%' }} onClick={login} disabled={busy || !sid || !pw}>
            {busy ? <span className="spin">⟳</span> : 'View Profile →'}
          </button>
        </div>
      )}

      {/* ── PROFILE ── */}
      {phase === 'profile' && student && (
        <div className="au">

          {/* Profile header with photo */}
          <div className="card" style={{
            marginBottom: 14,
            background: 'linear-gradient(135deg, rgba(124,92,252,.1) 0%, rgba(16,185,129,.06) 100%)',
            borderColor: 'rgba(124,92,252,.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* Avatar — read-only in parent view */}
              <Avatar
                studentId={student.id}
                name={student.name}
                avatarUrl={student.avatar_url}
                size={72}
                editable={false}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{student.name}</h2>
                <div style={{ color: 'var(--sub)', fontSize: 13, marginTop: 2 }}>Parent: {student.parent_name}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge bp">🪪 {student.id}</span>
                  <span className="badge be">📖 {learnedWords} words</span>
                  <span className="badge bgo">✏️ {subs.length} tests</span>
                </div>
              </div>
              {/* Score ring on right */}
              <Ring pct={pct} size={72} color={scoreColor} label={`${pct}%`} sub="score" />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { icon: '📖', val: learnedWords, label: 'Learned Words', col: 'var(--accent)' },
              { icon: '✏️', val: subs.length, label: 'Tests Taken', col: 'var(--gold)' },
              { icon: '⭐', val: `${pct}%`, label: 'Avg Score', col: 'var(--emerald)' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: s.col, marginTop: 4, fontFamily: "'Syne',sans-serif" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Overall Progress</h3>
              <span className="badge bgo" style={{ fontSize: 10 }}>Right Answers / Total Questions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Ring pct={pct} size={90} color={scoreColor} />
              <div style={{ flex: 1 }}>
                {[
                  { label: `Correct (${totalCorrect})`, val: totalCorrect, max: totalPossible || 1, col: 'var(--emerald)' },
                  { label: `Words (${learnedWords})`, val: learnedWords, max: Math.max(learnedWords, 1), col: 'var(--accent)' },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--sub)', marginBottom: 5 }}>
                      <span>{row.label}</span>
                    </div>
                    <div className="progress-track" style={{ height: 7 }}>
                      <div className="progress-fill" style={{ width: `${Math.min((row.val / row.max) * 100, 100)}%`, background: row.col }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {(['overview', 'tests', 'words'] as Tab[]).map(t => (
              <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
                {t === 'overview' ? '📊 Overview' : t === 'tests' ? '✏️ Tests' : '📖 Words'}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="card au">
              {[
                ['📖 Total words learned', learnedWords, 'var(--text)'],
                ['✏️ Tests completed', subs.length, 'var(--text)'],
                ['⭐ Total correct answers', totalCorrect, 'var(--emerald)'],
                ['📊 Score percentage', `${pct}%`, scoreColor],
              ].map(([l, v, c], i, arr) => (
                <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--sub)', fontSize: 13 }}>{l}</span>
                  <strong style={{ color: String(c) }}>{v}</strong>
                </div>
              ))}
            </div>
          )}

          {tab === 'tests' && (
            <div className="au">
              {subs.length === 0
                ? <div className="card" style={{ textAlign: 'center', color: 'var(--sub)' }}>No tests taken yet.</div>
                : subs.map((sub, i) => {
                    const p = Math.round((sub.score / sub.total) * 100)
                    const col = p >= 80 ? 'var(--emerald)' : p >= 60 ? 'var(--gold)' : 'var(--danger)'
                    return (
                      <div key={i} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: p >= 80 ? 'rgba(16,185,129,.15)' : p >= 60 ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {p >= 80 ? '🏆' : p >= 60 ? '👍' : '📚'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>📅 {sub.form_date}</div>
                          <div style={{ color: 'var(--sub)', fontSize: 11, marginTop: 1 }}>{new Date(sub.submitted_at).toLocaleString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: 20, color: col, fontFamily: "'Syne',sans-serif" }}>{sub.score}/{sub.total}</div>
                          <div style={{ fontSize: 11, color: 'var(--sub)' }}>{p}%</div>
                        </div>
                      </div>
                    )
                  })
              }
            </div>
          )}

          {tab === 'words' && (
            <div className="au">
              <div style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 12 }}>
                5 words × {wordDates.length} day{wordDates.length !== 1 ? 's' : ''} = <strong style={{ color: 'var(--text)' }}>{learnedWords}</strong> total
              </div>
              {wordDates.length === 0
                ? <div className="card" style={{ textAlign: 'center', color: 'var(--sub)' }}>No words published yet.</div>
                : wordDates.map((date, i) => (
                    <div key={i} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>📅 {date}</span>
                      <span className="badge be">5 words</span>
                    </div>
                  ))
              }
            </div>
          )}

          <button className="btn btn-gh" style={{ width: '100%', marginTop: 18 }} onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  )
}
