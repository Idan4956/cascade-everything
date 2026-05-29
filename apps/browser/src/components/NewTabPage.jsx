import React, { useState } from 'react'

const QUICK_LINKS = [
  { label: 'Google', url: 'https://www.google.com', color: '#4285f4' },
  { label: 'YouTube', url: 'https://www.youtube.com', color: '#ff0000' },
  { label: 'GitHub', url: 'https://github.com', color: '#e8e8f0' },
  { label: 'Reddit', url: 'https://www.reddit.com', color: '#ff4500' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org', color: '#888899' },
  { label: 'X / Twitter', url: 'https://www.x.com', color: '#1da1f2' },
]

export default function NewTabPage({ onNavigate }) {
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) onNavigate(query.trim())
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 36, background: 'var(--bg)', padding: 32, userSelect: 'none',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Cascade Browser</div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 560 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '0 16px', height: 48,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Google or enter a URL"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 15, userSelect: 'text',
            }}
          />
          {query && (
            <button type="submit" style={{
              padding: '4px 14px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Go</button>
          )}
        </div>
      </form>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 560 }}>
        {QUICK_LINKS.map(({ label, url, color }) => (
          <button
            key={url}
            onClick={() => onNavigate(url)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--surface2)', color: 'var(--muted)',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
