'use client'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'ok' | 'err'
  onDone?: () => void
}

export function Toast({ message, type = 'ok', onDone }: ToastProps) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.() }, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  if (!visible) return null
  return <div className={`toast toast-${type}`}>{message}</div>
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'ok' | 'err' } | null>(null)
  const show = (message: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3200)
  }
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} /> : null
  return { show, ToastEl }
}
