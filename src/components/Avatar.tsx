'use client'
import { useState, useRef } from 'react'
import { uploadAvatar, updateStudentAvatar } from '@/lib/supabase'

interface AvatarProps {
  studentId: string
  name: string
  avatarUrl: string | null
  size?: number
  editable?: boolean
  onUpdated?: (url: string) => void
}

export function Avatar({ studentId, name, avatarUrl, size = 60, editable = false, onUpdated }: AvatarProps) {
  const [url, setUrl] = useState<string | null>(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [hover, setHover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const publicUrl = await uploadAvatar(studentId, file)
    if (publicUrl) {
      await updateStudentAvatar(studentId, publicUrl)
      // Cache-bust so browser reloads the image
      const busted = `${publicUrl}?t=${Date.now()}`
      setUrl(busted)
      onUpdated?.(publicUrl)
    }
    setUploading(false)
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  const fontSize = size * 0.35

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Photo or initials */}
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          overflow: 'hidden', cursor: editable ? 'pointer' : 'default',
          border: '2.5px solid var(--border)',
          boxShadow: '0 4px 16px rgba(0,0,0,.3)',
          position: 'relative',
          transition: 'border-color .2s',
          borderColor: hover && editable ? 'var(--accent)' : 'var(--border)',
        }}
        onClick={() => editable && inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {url ? (
          <img
            src={url}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, var(--accent), var(--emerald))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize, color: '#fff',
          }}>
            {initials}
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.3,
          }}>
            <span className="spin">⟳</span>
          </div>
        )}

        {/* Edit hover overlay */}
        {editable && !uploading && hover && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2,
          }}>
            <span style={{ fontSize: size * 0.28 }}>📷</span>
            {size >= 80 && (
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>Change</span>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
      )}
    </div>
  )
}
