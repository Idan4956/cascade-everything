import React, { useState } from 'react'

function extIcon(filePath) {
  const ext = (filePath || '').split('.').pop().toLowerCase()
  const colors = { pdf: '#ef4444', docx: '#3b82f6', doc: '#3b82f6', xlsx: '#22c55e', xls: '#22c55e', csv: '#22c55e', md: '#a78bfa', txt: '#94a3b8', json: '#fb923c' }
  const labels = { pdf: 'PDF', docx: 'DOC', doc: 'DOC', xlsx: 'XLS', xls: 'XLS', csv: 'CSV', md: 'MD', txt: 'TXT', json: 'JSON' }
  return { color: colors[ext] || '#64748b', label: labels[ext] || ext.toUpperCase().slice(0,3) }
}

function basename(p) {
  return (p || '').replace(/\\/g, '/').split('/').pop()
}

function shortPath(p) {
  if (!p) return ''
  const parts = p.replace(/\\/g, '/').split('/')
  return parts.length > 2 ? '…/' + parts.slice(-2, -1)[0] : parts.slice(0, -1).join('/')
}

export default function Sidebar({ recentFiles, currentFile, onSelect, onOpen, onRemove }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 12px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.6, textTransform: 'uppercase' }}>Recent</span>
        <button onClick={onOpen} title="Open file" style={{
          background: 'var(--accent-soft)', border: 'none', color: 'var(--accent)',
          cursor: 'pointer', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
        }}>Open</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {recentFiles.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
            No recent documents
          </div>
        )}
        {recentFiles.map((filePath, i) => {
          const { color, label } = extIcon(filePath)
          const active = filePath === currentFile
          const hov = hoveredIdx === i
          return (
            <div
              key={filePath}
              onClick={() => onSelect(filePath)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                background: active ? 'var(--accent-soft)' : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 6, background: color + '22',
                border: `1px solid ${color}44`, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color, letterSpacing: 0.3,
              }}>{label}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {basename(filePath)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                  {shortPath(filePath)}
                </div>
              </div>
              {hov && (
                <button
                  onClick={e => { e.stopPropagation(); onRemove(filePath) }}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--muted)',
                    cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center',
                    borderRadius: 4, flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L6 4.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L7.06 6l2.72 2.72a.75.75 0 1 1-1.06 1.06L6 7.06 3.28 9.78a.75.75 0 0 1-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 0 1 0-1.06z"/>
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
