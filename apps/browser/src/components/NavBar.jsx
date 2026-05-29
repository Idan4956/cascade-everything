import React, { useState, useRef, useEffect, useCallback } from 'react'

export default function NavBar({ tab, bookmarks, downloads, onNavigate, onBack, onForward, onReload, onHome, onBookmark }) {
  const [inputVal, setInputVal] = useState('')
  const [focused, setFocused] = useState(false)
  const [showDownloads, setShowDownloads] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!focused) setInputVal(tab?.displayUrl || '')
  }, [tab?.displayUrl, focused])

  useEffect(() => {
    const done = downloads.filter(d => d.done)
    if (done.length > 0) setShowDownloads(true)
  }, [downloads])

  const handleFocus = () => {
    setFocused(true)
    setInputVal(tab?.displayUrl || '')
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleBlur = () => {
    setFocused(false)
    setInputVal(tab?.displayUrl || '')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
      onNavigate(inputVal)
    } else if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const isBookmarked = bookmarks.some(b => b.url === tab?.displayUrl)
  const isSecure = tab?.displayUrl?.startsWith('https://')
  const activeDownloads = downloads.filter(d => !d.done)

  return (
    <div style={{
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '0 8px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {/* Back */}
      <NavBtn onClick={onBack} disabled={!tab?.canGoBack} title="Back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </NavBtn>

      {/* Forward */}
      <NavBtn onClick={onForward} disabled={!tab?.canGoForward} title="Forward">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </NavBtn>

      {/* Reload / Stop */}
      <NavBtn onClick={onReload} title={tab?.loading ? 'Stop' : 'Reload'}>
        {tab?.loading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        )}
      </NavBtn>

      {/* Home */}
      <NavBtn onClick={onHome} title="Home">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </NavBtn>

      {/* Address bar */}
      <div style={{
        flex: 1, height: 32, display: 'flex', alignItems: 'center', gap: 6,
        background: focused ? 'var(--surface2)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8, padding: '0 10px', transition: 'border-color 0.15s',
        cursor: 'text',
      }} onClick={() => inputRef.current?.focus()}>
        {/* Lock icon */}
        {!focused && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isSecure ? '#22c55e' : 'var(--muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            {isSecure
              ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
              : <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>
            }
          </svg>
        )}
        <input
          ref={inputRef}
          value={focused ? inputVal : (tab?.displayUrl || '')}
          onChange={e => setInputVal(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search or enter URL"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: 13, userSelect: 'text',
          }}
        />
      </div>

      {/* Bookmark star */}
      <NavBtn onClick={onBookmark} title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill={isBookmarked ? '#f59e0b' : 'none'} stroke={isBookmarked ? '#f59e0b' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </NavBtn>

      {/* Downloads */}
      {downloads.length > 0 && (
        <div style={{ position: 'relative' }}>
          <NavBtn onClick={() => setShowDownloads(v => !v)} title="Downloads">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activeDownloads.length > 0 ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </NavBtn>
          {showDownloads && (
            <DownloadsPanel downloads={downloads} onClose={() => setShowDownloads(false)} />
          )}
        </div>
      )}
    </div>
  )
}

function NavBtn({ onClick, disabled, title, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 6, border: 'none', flexShrink: 0,
        background: hov && !disabled ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: disabled ? 'rgba(255,255,255,0.25)' : 'var(--muted)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}>
      {children}
    </button>
  )
}

function DownloadsPanel({ downloads, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 300, zIndex: 100,
      background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Downloads</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16 }}>×</button>
      </div>
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        {[...downloads].reverse().map((d, i) => (
          <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</span>
            <span style={{ fontSize: 11, color: d.state === 'completed' ? '#22c55e' : d.done ? '#ef4444' : 'var(--muted)' }}>
              {d.state === 'completed' ? 'Complete' : d.done ? 'Failed' : 'Downloading…'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
