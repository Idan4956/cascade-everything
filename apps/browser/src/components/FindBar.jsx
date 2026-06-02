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
  const noResults = hasResult && count.matches === 0

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      width: 320,
      background: 'var(--surface2)',
      border: '1px solid var(--border-mid)',
      borderRadius: 10,
      padding: '6px 8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      {/* Search icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      {/* Input */}
      <input
        ref={inputRef}
        value={query}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Find in page…"
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          outline: 'none',
          color: noResults ? '#ef4444' : 'var(--text)',
          fontSize: 13,
          userSelect: 'text',
          minWidth: 0,
        }}
      />

      {/* Match count */}
      {hasResult && (
        <span style={{
          fontSize: 11,
          color: noResults ? '#ef4444' : 'var(--muted)',
          flexShrink: 0,
          minWidth: 46,
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {noResults ? 'No results' : `${count.active} / ${count.matches}`}
        </span>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <IBtn onClick={onPrev} title="Previous  Shift+Enter" disabled={!query}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </IBtn>
        <IBtn onClick={onNext} title="Next  Enter" disabled={!query}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </IBtn>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0 }} />

      {/* Close */}
      <button
        onClick={onClose}
        title="Close  Esc"
        style={{
          width: 22, height: 22,
          borderRadius: 5,
          border: 'none',
          flexShrink: 0,
          background: 'transparent',
          color: 'var(--muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.1s, color 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function IBtn({ onClick, title, disabled, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 26, height: 26,
        borderRadius: 5,
        border: 'none',
        background: hov && !disabled ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: disabled ? 'rgba(255,255,255,0.2)' : hov ? 'var(--text)' : 'var(--muted)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
    >
      {children}
    </button>
  )
}
