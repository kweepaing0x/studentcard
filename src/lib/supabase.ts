import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ────────────────────────────────────────────────────────────────────
export interface Student {
  id: string
  name: string
  parent_name: string | null
  parent_password: string
  avatar_url: string | null
  created_at?: string
}

export interface DailyWord {
  id?: number
  word_date: string
  english: string
  myanmar: string
}

export interface QuizQuestion {
  word: string
  question: string
  correct_answer: string
  options: string[]
}

export interface QuestionForm {
  id?: number
  form_date: string
  questions: QuizQuestion[]
}

export interface Submission {
  id?: number
  student_id: string
  form_date: string
  answers: Record<string, string>
  score: number
  total: number
  submitted_at?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function slugToDate(slug: string): string {
  const mm = slug.slice(0, 2)
  const dd = slug.slice(2, 4)
  const year = new Date().getFullYear()
  return `${year}-${mm}-${dd}`
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function buildQuestions(words: DailyWord[]): QuizQuestion[] {
  return words.map((w, i) => {
    const others = words.filter((_, j) => j !== i)
    if (i % 2 === 0) {
      return {
        word: w.english,
        question: `What is the Myanmar meaning of "${w.english}"?`,
        correct_answer: w.myanmar,
        options: shuffle([w.myanmar, ...others.slice(0, 3).map(o => o.myanmar)]),
      }
    } else {
      return {
        word: w.myanmar,
        question: `Which English word means "${w.myanmar}"?`,
        correct_answer: w.english,
        options: shuffle([w.english, ...others.slice(0, 3).map(o => o.english)]),
      }
    }
  })
}

// ── Storage helpers ───────────────────────────────────────────────────────────
export const BUCKET = 'student_profiles'

export async function uploadAvatar(studentId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const path = `${studentId}.${ext}`

  // Remove old file first (upsert style)
  await supabase.storage.from(BUCKET).remove([path])

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) { console.error('Upload error:', error); return null }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function updateStudentAvatar(studentId: string, avatarUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from('students')
    .update({ avatar_url: avatarUrl })
    .eq('id', studentId)
  return !error
}
