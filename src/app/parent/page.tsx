'use client'
import { useState, useCallback } from 'react'
import { supabase, type Student } from '@/lib/supabase'
import { Ring } from '@/components/Ring'
import { Avatar } from '@/components/Avatar'

type Phase = 'login' | 'profile'
type Tab = 'overview' | 'tests' | 'words'
type Lang = 'mm' | 'en'

interface SubRow {
  form_date: string
  score: number
  total: number
  submitted_at: string
}

// ── Translations ─────────────────────────────────────────────────────────────
const T = {
  mm: {
    title: 'မိဘ Portal',
    subtitle: 'သင်၏ကလေး၏ တိုးတက်မှုကို ကြည့်ရှုရန် Login ဝင်ပါ',
    studentId: 'ကျောင်းသား ID',
    password: 'မိဘ စကားဝှက်',
    loginBtn: 'ကြည့်ရှုမည် →',
    parent: 'မိဘ',
    learnedWords: 'သင်ယူပြီး စကားလုံး',
    tests: 'စာမေးပွဲ',
    avgScore: 'ပျမ်းမျှ အမှတ်',
    progress: 'တိုးတက်မှု',
    scoreLabel: 'မှန်သောအဖြေ / မေးခွန်းပေါင်း',
    correct: 'မှန်သောအဖြေ',
    words: 'သင်ယူပြီး စကားလုံး',
    overview: '📊 အကျဉ်းချုပ်',
    testsTab: '✏️ စာမေးပွဲ',
    wordsTab: '📖 စကားလုံး',
    totalWords: '📖 စုစုပေါင်း သင်ယူပြီး စကားလုံး',
    totalTests: '✏️ ဖြေဆိုပြီး စာမေးပွဲ',
    totalCorrect: '⭐ စုစုပေါင်း မှန်သောအဖြေ',
    scorePercent: '📊 ရမှတ် ရာခိုင်နှုန်း',
    noTests: 'မည်သည့် စာမေးပွဲမျှ မဖြေရသေး',
    noWords: 'မည်သည့် စကားလုံးမျှ မသင်ရသေး',
    daysWords: (d: number, w: number) => `5 လုံး × ${d} ရက် = စုစုပေါင်း ${w} လုံး`,
    wordsPerDay: '5 လုံး',
    wrongPw: 'ကျောင်းသား ID (သို့) စကားဝှက် မမှန်ပါ',
    logout: 'ထွက်မည်',
  },
  en: {
    title: 'Parent Portal',
    subtitle: "Login to view your child's progress",
    studentId: 'Student ID',
    password: 'Parent Password',
    loginBtn: 'View Profile →',
    parent: 'Parent',
    learnedWords: 'Learned Words',
    tests: 'Tests Taken',
    avgScore: 'Avg Score',
    progress: 'Overall Progress',
    scoreLabel: 'Right Answers / Total Questions',
    correct: 'Correct answers',
    words: 'Words learned',
    overview: '📊 Overview',
    testsTab: '✏️ Tests',
    wordsTab: '📖 Words',
    totalWords: '📖 Total words learned',
    totalTests: '✏️ Tests completed',
    totalCorrect: '⭐ Total correct answers',
    scorePercent: '📊 Score percentage',
    noTests: 'No tests taken yet.',
    noWords: 'No words published yet.',
    daysWords: (d: number, w: number) => `5 words × ${d} day${d !== 1 ? 's' : ''} = ${w} total`,
    wordsPerDay: '5 words',
    wrongPw: 'Incorrect Student ID or password.',
    logout: 'Logout',
  },
}

// ── Lang Toggle ───────────────────────────────────────────────────────────────
function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div style={{
      display: 'inline-flex', borderRadius: 10, overflow: 'hidden',
      border: '1px solid var(--border)', flexShrink: 0,
    }}>
      {(['mm', 'en'] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: '6px 14px', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          background: lang === l ? 'var(--accent)' : 'var(--card)',
          color: lang === l ? '#fff' : 'var(--sub)',
          transition: 'all .18s',
        }}>
          {l === 'mm' ? '🇲🇲 မြန်မာ' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  )
}

export default function ParentPage() {
  const [lang, setLang] = useState<Lang>('mm')
  const t = T[lang]

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
      setErr(t.wrongPw); setBusy(false); return
    }
    const s = students[0] as Student

    const [{ data: subData }, { data: wData }] = await Promise.all([
      supabase.from('submissions').select('form_date,score,total,submitted_at').eq('student_id', sid).order('form_date', { ascending: false }),
      supabase.from('daily_words').select('word_date').order('word_date', { ascending: false }),
    ])

    const uniqueDates = Array.from(new Set((wData || []).map((w: { word_date: string }) => w.word_date)))
    setStudent(s)
    setSubs((subData || []) as SubRow[])
    setWordDates(uniqueDates)
    setPhase('profile')
    setBusy(false)
  }, [sid, pw, t.wrongPw])

  const logout = () => {
    setPhase('login'); setStudent(null); setSid(''); setPw(''); setTab('overview')
  }

  const learnedWords = wordDates.length * 5
  const totalCorrect = subs.reduce((a, x) => a + x.score, 0)
  const totalPossible = subs.reduce((a, x) => a + x.total, 0)
  const pct = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : 0
  const scoreColor = pct >= 80 ? 'var(--emerald)' : pct >= 60 ? 'var(--gold)' : 'var(--danger)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px' }} className="au">

        {/* ── LOGIN ── */}
        {phase === 'login' && (
          <div>
            {/* Lang toggle top right */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
              <LangToggle lang={lang} setLang={setLang} />
            </div>

            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 44 }}>👨‍👩‍👧</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 10 }}>{t.title}</h1>
                <p style={{ color: 'var(--sub)', fontSize: 13, marginTop: 4 }}>{t.subtitle}</p>
              </div>

              {err && <div className="err-box">{err}</div>}

              <div style={{ marginBottom: 14 }}>
                <label>{t.studentId}</label>
                <input className="input" placeholder="STU-001" value={sid}
                  onChange={e => setSid(e.target.value.toUpperCase())} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label>{t.password}</label>
                <input className="input" type="password" placeholder="••••••••" value={pw}
                  onChange={e => setPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && login()} />
              </div>
              <button className="btn btn-g" style={{ width: '100%' }} onClick={login} disabled={busy || !sid || !pw}>
                {busy ? <span className="spin">⟳</span> : t.loginBtn}
              </button>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {phase === 'profile' && student && (
          <div className="au">
            {/* Top bar: lang toggle + logout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <LangToggle lang={lang} setLang={setLang} />
              <button className="btn btn-gh" style={{ padding: '6px 14px', fontSize: 12 }} onClick={logout}>
                {t.logout}
              </button>
            </div>

            {/* Profile header */}
            <div className="card" style={{
              marginBottom: 14,
              background: 'linear-gradient(135deg, rgba(124,92,252,.1) 0%, rgba(16,185,129,.06) 100%)',
              borderColor: 'rgba(124,92,252,.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar studentId={student.id} name={student.name} avatarUrl={student.avatar_url} size={68} editable={false} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>{student.name}</h2>
                  <div style={{ color: 'var(--sub)', fontSize: 13, marginTop: 2 }}>{t.parent}: {student.parent_name}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge bp">🪪 {student.id}</span>
                    <span className="badge be">📖 {learnedWords}</span>
                    <span className="badge bgo">✏️ {subs.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { icon: '📖', val: learnedWords, label: t.learnedWords, col: 'var(--accent)' },
                { icon: '✏️', val: subs.length,  label: t.tests,        col: 'var(--gold)' },
                { icon: '⭐', val: `${pct}%`,    label: t.avgScore,     col: 'var(--emerald)' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div style={{ fontSize: 18 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.col, marginTop: 3, fontFamily: "'Syne',sans-serif" }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 2, lineHeight: 1.3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700 }}>{t.progress}</h3>
                <span className="badge bgo" style={{ fontSize: 10 }}>{t.scoreLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Ring pct={pct} size={84} color={scoreColor} />
                <div style={{ flex: 1 }}>
                  {[
                    { label: `${t.correct} (${totalCorrect})`, val: totalCorrect, max: totalPossible || 1, col: 'var(--emerald)' },
                    { label: `${t.words} (${learnedWords})`,   val: learnedWords, max: Math.max(learnedWords, 1), col: 'var(--accent)' },
                  ].map(row => (
                    <div key={row.label} style={{ marginBottom: 11 }}>
                      <div style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 4 }}>{row.label}</div>
                      <div className="progress-track" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${Math.min((row.val / row.max) * 100, 100)}%`, background: row.col }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {(['overview', 'tests', 'words'] as Tab[]).map(t2 => (
                <button key={t2} className={`tab ${tab === t2 ? 'on' : ''}`} onClick={() => setTab(t2)} style={{ flex: 1, textAlign: 'center' }}>
                  {t2 === 'overview' ? t.overview : t2 === 'tests' ? t.testsTab : t.wordsTab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === 'overview' && (
              <div className="card au">
                {[
                  [t.totalWords,   learnedWords,  'var(--text)'],
                  [t.totalTests,   subs.length,   'var(--text)'],
                  [t.totalCorrect, totalCorrect,  'var(--emerald)'],
                  [t.scorePercent, `${pct}%`,     scoreColor],
                ].map(([l, v, c], i, arr) => (
                  <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--sub)', fontSize: 13 }}>{l}</span>
                    <strong style={{ color: String(c) }}>{v}</strong>
                  </div>
                ))}
              </div>
            )}

            {/* Tests */}
            {tab === 'tests' && (
              <div className="au">
                {subs.length === 0
                  ? <div className="card" style={{ textAlign: 'center', color: 'var(--sub)', fontSize: 14 }}>{t.noTests}</div>
                  : subs.map((sub, i) => {
                      const p = Math.round((sub.score / sub.total) * 100)
                      const col = p >= 80 ? 'var(--emerald)' : p >= 60 ? 'var(--gold)' : 'var(--danger)'
                      return (
                        <div key={i} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: p >= 80 ? 'rgba(16,185,129,.15)' : p >= 60 ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {p >= 80 ? '🏆' : p >= 60 ? '👍' : '📚'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>📅 {sub.form_date}</div>
                            <div style={{ color: 'var(--sub)', fontSize: 11, marginTop: 1 }}>{new Date(sub.submitted_at).toLocaleString()}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, fontSize: 19, color: col, fontFamily: "'Syne',sans-serif" }}>{sub.score}/{sub.total}</div>
                            <div style={{ fontSize: 11, color: 'var(--sub)' }}>{p}%</div>
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            )}

            {/* Words */}
            {tab === 'words' && (
              <div className="au">
                <div style={{ color: 'var(--sub)', fontSize: 13, marginBottom: 12 }}>
                  {t.daysWords(wordDates.length, learnedWords)}
                </div>
                {wordDates.length === 0
                  ? <div className="card" style={{ textAlign: 'center', color: 'var(--sub)', fontSize: 14 }}>{t.noWords}</div>
                  : wordDates.map((date, i) => (
                      <div key={i} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>📅 {date}</span>
                        <span className="badge be">{t.wordsPerDay}</span>
                      </div>
                    ))
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
