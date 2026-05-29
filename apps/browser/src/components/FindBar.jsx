import React, { useEffect, useRef, useState } from 'react'

export default function FindBar({ query, count, onChange, onNext, onPrev, onClose }) {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.shiftKey ? onPrev() : onNext()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const hasResult = count && count.matches !== undefined

  return (
    <div style={{
      position: 'absolute', bottom: 16, right: 16, zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 10, padding: '6px 8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      width: 320,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <input
        ref={inputRef}
        value={query}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Find in page…"
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: 'var(--text)', fontSize: 13, userSelect: 'text',
        }}
      />

      {hasResult && (
        <span style={{ fontSize: 11, color: count.matches === 0 ? '#ef4444' : 'var(--muted)', flexShrink: 0, minWidth: 40, textAlign: 'center' }}>
          {count.matches === 0 ? 'No results' : `${count.active} / ${count.matches}`}
        </span>
      )}

      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <IBtn onClick={onPrev} title="Previous  Shift+Enter" disabled={!query}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>
        </IBtn>
        <IBtn onClick={onNext} title="Next  Enter" disabled={!query}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </IBtn>
      </div>

      <button onClick={onClose} title="Close  Esc" style={{
        width: 22, height: 22, borderRadius: 5, border: 'none', flexShrink: 0,
        background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        transition: 'background 0.1s, color 0.1s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
      >×</button>
    </div>
  )
}

function IBtn({ onClick, title, disabled, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 26, height: 26, borderRadius: 5, border: 'none',
        background: hov && !disabled ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: disabled ? 'rgba(255,255,255,0.25)' : 'var(--muted)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s',
      }}>{children}</button>
  )
}
