'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase, type DailyWord, type Student } from '@/lib/supabase'
import { Avatar } from '@/components/Avatar'
import { useToast } from '@/components/Toast'

type WordEntry = { english: string; myanmar: string }
type WordsByDate = Record<string, DailyWord[]>

export default function AdminPage() {
  const [tab, setTab] = useState<'publish' | 'history' | 'students'>('publish')
  const [wordDate, setWordDate] = useState(() => new Date().toISOString().split('T')[0])
  const [words, setWords] = useState<WordEntry[]>(Array(5).fill(null).map(() => ({ english: '', myanmar: '' })))
  const [students, setStudents] = useState<Student[]>([])
  const [wordsByDate, setWordsByDate] = useState<WordsByDate>({})
  const [ns, setNs] = useState({ id: '', name: '', parent_name: '', parent_password: '' })
  const [busy, setBusy] = useState(false)
  const { show, ToastEl } = useToast()

  const load = useCallback(async () => {
    const [{ data: sts }, { data: wds }] = await Promise.all([
      supabase.from('students').select('*').order('id'),
      supabase.from('daily_words').select('*').order('word_date', { ascending: false }).limit(100),
    ])
    if (sts) setStudents(sts as Student[])
    if (wds) {
      const byDate: WordsByDate = {}
      wds.forEach((w: DailyWord) => { (byDate[w.word_date] = byDate[w.word_date] || []).push(w) })
      setWordsByDate(byDate)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const setWord = (i: number, field: 'english' | 'myanmar', val: string) =>
    setWords(prev => prev.map((w, j) => j === i ? { ...w, [field]: val } : w))

  const publish = async () => {
    if (words.some(w => !w.english.trim() || !w.myanmar.trim())) {
      show('Fill all 5 words first!', 'err'); return
    }
    const { data: existing } = await supabase.from('daily_words').select('id').eq('word_date', wordDate)
    if (existing && existing.length > 0) { show('Words already published for this date!', 'err'); return }
    setBusy(true)
    try {
      const { error } = await supabase.from('daily_words').insert(
        words.map(w => ({ word_date: wordDate, english: w.english.trim(), myanmar: w.myanmar.trim() }))
      )
      if (error) throw error
      const slug = wordDate.slice(5).replace('-', '')
      show(`✅ Published! Quiz auto-created at /${slug}`)
      setWords(Array(5).fill(null).map(() => ({ english: '', myanmar: '' })))
      load()
    } catch (e: unknown) { show('Error: ' + (e as Error).message, 'err') }
    setBusy(false)
  }

  const addStudent = async () => {
    if (!ns.id || !ns.name || !ns.parent_password) { show('Fill required fields!', 'err'); return }
    setBusy(true)
    const { error } = await supabase.from('students').insert([{ ...ns, avatar_url: null }])
    if (error) show('Error: ' + error.message, 'err')
    else { show('✅ Student added!'); setNs({ id: '', name: '', parent_name: '', parent_password: '' }); load() }
    setBusy(false)
  }

  const slug = wordDate.slice(5).replace('-', '')

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }} className="au">
      {ToastEl}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(245,158,11,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚙️</div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Admin Panel</h1>
          <div style={{ color: 'var(--sub)', fontSize: 13, marginTop: 2 }}>Publish daily words · Quiz auto-generates via Supabase trigger</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {(['publish', 'history', 'students'] as const).map(t => (
          <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t === 'publish' ? '📝 Publish' : t === 'history' ? '📚 History' : '👥 Students'}
          </button>
        ))}
      </div>

      {/* ── PUBLISH ── */}
      {tab === 'publish' && (
        <div className="au">
          <div style={{ background: 'rgba(124,92,252,.08)', border: '1px solid rgba(124,92,252,.25)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-lt)', marginBottom: 6 }}>⚡ Fully Automatic Flow</div>
            <div style={{ color: 'var(--sub)', lineHeight: 1.7 }}>
              1. Enter 5 words → Publish<br />
              2. Supabase DB trigger <strong style={{ color: 'var(--text)' }}>instantly generates the quiz</strong><br />
              3. Quiz live at <span style={{ color: 'var(--accent-lt)', fontFamily: 'monospace' }}>/{slug}</span> — zero extra steps
            </div>
          </div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 20 }}>
              <label>📅 Lesson Date</label>
              <input className="input" type="date" value={wordDate} onChange={e => setWordDate(e.target.value)} style={{ maxWidth: 220 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>5 Daily Words</h3>
              <span className="badge bgo" style={{ fontSize: 10 }}>Trigger builds quiz ✨</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: '8px 12px', alignItems: 'center', marginBottom: 4 }}>
              <div /><label style={{ marginBottom: 0 }}>English Word</label><label style={{ marginBottom: 0 }}>Myanmar Meaning</label>
            </div>
            {words.map((w, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr', gap: '6px 12px', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--sub)' }}>{i + 1}</div>
                <input className="input" placeholder="e.g. Eloquent" value={w.english} onChange={e => setWord(i, 'english', e.target.value)} />
                <input className="input" placeholder="ဝါကျကောင်းသော" value={w.myanmar} onChange={e => setWord(i, 'myanmar', e.target.value)} />
              </div>
            ))}
            <button className="btn btn-p" style={{ width: '100%', marginTop: 12 }} onClick={publish} disabled={busy}>
              {busy ? <span className="spin">⟳</span> : '🚀 Publish 5 Words'}
            </button>
          </div>
          <div style={{ background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--sub)' }}>
            💡 Quiz will be live at <span style={{ color: 'var(--accent-lt)', fontFamily: 'monospace', fontWeight: 600 }}>/{slug}</span> within seconds
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div className="au">
          {Object.keys(wordsByDate).length === 0
            ? <div className="card" style={{ textAlign: 'center', color: 'var(--sub)' }}>No words published yet.</div>
            : Object.entries(wordsByDate).sort(([a], [b]) => (b > a ? 1 : -1)).map(([date, wds]) => {
                const s = date.slice(5).replace('-', '')
                return (
                  <div key={date} className="card" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Syne',sans-serif" }}>📅 {date}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className="badge be">{wds.length} words</span>
                        <span className="badge bp" style={{ fontSize: 10, fontFamily: 'monospace' }}>/{s}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {wds.map((w, i) => (
                        <div key={i} className="word-row">
                          <div><div style={{ fontWeight: 600, fontSize: 14 }}>{w.english}</div><div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 1 }}>English</div></div>
                          <span style={{ color: 'var(--sub)' }}>→</span>
                          <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600, fontSize: 14, color: 'var(--accent-lt)' }}>{w.myanmar}</div><div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 1 }}>Myanmar</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
          }
        </div>
      )}

      {/* ── STUDENTS ── */}
      {tab === 'students' && (
        <div className="au">
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>➕ Add New Student</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {([
                ['id', 'Student ID *', 'STU-004', 'text'],
                ['name', 'Student Name *', 'Mg Aung Aung', 'text'],
                ['parent_name', 'Parent Name', 'U Ko Ko', 'text'],
                ['parent_password', 'Parent Password *', '', 'password'],
              ] as [keyof typeof ns, string, string, string][]).map(([field, lbl, ph, type]) => (
                <div key={field}>
                  <label>{lbl}</label>
                  <input className="input" placeholder={ph} type={type} value={ns[field]}
                    onChange={e => setNs(p => ({ ...p, [field]: field === 'id' ? e.target.value.toUpperCase() : e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(124,92,252,.07)', borderRadius: 10, fontSize: 12, color: 'var(--sub)' }}>
              📷 Profile photo can be uploaded after adding the student
            </div>
            <button className="btn btn-g" style={{ marginTop: 14, width: '100%' }} onClick={addStudent} disabled={busy}>
              {busy ? <span className="spin">⟳</span> : 'Add Student'}
            </button>
          </div>

          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>All Students ({students.length})</h3>
          {students.map((s) => (
            <div key={s.id} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Editable avatar — click to upload */}
              <Avatar
                studentId={s.id}
                name={s.name}
                avatarUrl={s.avatar_url}
                size={52}
                editable={true}
                onUpdated={(url) => {
                  setStudents(prev => prev.map(x => x.id === s.id ? { ...x, avatar_url: url } : x))
                  show(`✅ Photo updated for ${s.name}`)
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                <div style={{ color: 'var(--sub)', fontSize: 12, marginTop: 2 }}>{s.id} · Parent: {s.parent_name || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: s.avatar_url ? 'var(--emerald)' : 'var(--sub)' }}>
                    {s.avatar_url ? '📷 Photo set' : '📷 No photo — click avatar to upload'}
                  </span>
                </div>
              </div>
              <span className="badge bp">{s.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
