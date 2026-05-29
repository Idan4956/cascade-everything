import React, { useState } from 'react'

const isMac = window.notesAPI?.platform === 'darwin'

export default function TitleBar({ noteTitle, onNew, search, onSearch }) {
  return (
    <div style={{
      height: 44,
      background: 'rgba(15,15,19,0.98)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: isMac ? '0 12px' : '0 0 0 12px',
      gap: 8,
      flexShrink: 0,
      WebkitAppRegion: 'drag',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4, flexShrink: 0 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M2 2h8v8H2z" rx="1"/>
            <line x1="4" y1="5" x2="8" y2="5"/>
            <line x1="4" y1="7.5" x2="7" y2="7.5"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>
          Cascade Notes
        </span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 320, WebkitAppRegion: 'no-drag' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="12" height="12" viewBox="0 0 16 16" fill="rgba(255,255,255,0.3)">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.868-3.834zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search notes…"
            style={{
              width: '100%', padding: '5px 10px 5px 28px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, color: 'var(--text)', fontSize: 12, outline: 'none',
              userSelect: 'text',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', WebkitAppRegion: 'no-drag', flexShrink: 0 }}>
        <button onClick={onNew} style={{
          background: 'var(--accent-soft)', border: '1px solid rgba(16,185,129,0.3)',
          color: 'var(--accent)', cursor: 'pointer', padding: '5px 12px',
          borderRadius: 7, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New
        </button>
        <div style={{ width: 1, background: 'var(--border)', margin: '8px 2px' }} />
        {isMac ? <MacControls /> : <WinControls />}
      </div>
    </div>
  )
}

function MacControls() {
  return (
    <>
      <MacBtn onClick={() => window.notesAPI.minimize()} color="#ffbd2e" />
      <MacBtn onClick={() => window.notesAPI.maximize()} color="#27c93f" />
      <MacBtn onClick={() => window.notesAPI.close()} color="#ff5f56" />
    </>
  )
}

function WinControls() {
  return (
    <div style={{ display: 'flex', alignSelf: 'stretch', marginLeft: 4 }}>
      <WinBtn onClick={() => window.notesAPI.minimize()} hoverColor="rgba(255,255,255,0.1)">
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
      </WinBtn>
      <WinBtn onClick={() => window.notesAPI.maximize()} hoverColor="rgba(255,255,255,0.1)">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="0.5" y="0.5" width="9" height="9"/>
        </svg>
      </WinBtn>
      <WinBtn onClick={() => window.notesAPI.close()} hoverColor="#c42b1c" close>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M1 1 L9 9 M9 1 L1 9"/>
        </svg>
      </WinBtn>
    </div>
  )
}

function WinBtn({ onClick, children, hoverColor, close }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 46, alignSelf: 'stretch', background: hov ? hoverColor : 'transparent',
        border: 'none', color: hov && close ? '#fff' : 'rgba(255,255,255,0.7)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s', flexShrink: 0,
      }}
    >{children}</button>
  )
}

function MacBtn({ onClick, color }) {
  return (
    <button onClick={onClick} style={{
      width: 13, height: 13, borderRadius: '50%', background: color,
      border: 'none', cursor: 'pointer', opacity: 0.85, transition: 'opacity 0.15s', flexShrink: 0,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
    />
  )
}
