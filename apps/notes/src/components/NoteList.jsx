import React, { useState } from 'react'

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function NoteList({ notes, selectedId, onSelect, onNew, onDelete }) {
  const [hoveredId, setHoveredId] = useState(null)

  if (notes.length === 0) {
    return (
      <div style={{
        width: 240, flexShrink: 0, background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24,
      }}>
        <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>No notes yet</div>
        <button onClick={onNew} style={{
          padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'var(--accent-soft)', border: '1px solid rgba(16,185,129,0.3)',
          color: 'var(--accent)', cursor: 'pointer',
        }}>Create first note</button>
      </div>
    )
  }

  return (
    <div style={{
      width: 240, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notes.map(note => {
          const active = note.id === selectedId
          const hov = hoveredId === note.id
          return (
            <div
              key={note.id}
              onClick={() => onSelect(note)}
              onMouseEnter={() => setHoveredId(note.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                padding: '11px 14px',
                background: active ? 'rgba(16,185,129,0.1)' : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                cursor: 'pointer', position: 'relative',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: active ? 'var(--accent)' : 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                }}>{note.title}</div>
                <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0, marginTop: 1 }}>
                  {relativeTime(note.mtime)}
                </span>
              </div>
              {note.preview && (
                <div style={{
                  fontSize: 11.5, color: 'var(--muted)', marginTop: 3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{note.preview}</div>
              )}
              {hov && (
                <button
                  onClick={e => { e.stopPropagation(); onDelete(note) }}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(239,68,68,0.15)', border: 'none', color: '#ef4444',
                    cursor: 'pointer', padding: '3px 5px', borderRadius: 5, display: 'flex', alignItems: 'center',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                  </svg>
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
