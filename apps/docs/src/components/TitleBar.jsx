import React, { useState } from 'react'

const isMac = window.docsAPI?.platform === 'darwin'

function basename(p) {
  if (!p) return ''
  return p.replace(/\\/g, '/').split('/').pop()
}

export default function TitleBar({ currentFile, onOpen }) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.5">
            <rect x="1" y="1" width="10" height="10" rx="1.5"/>
            <line x1="3" y1="4" x2="9" y2="4"/>
            <line x1="3" y1="6.5" x2="9" y2="6.5"/>
            <line x1="3" y1="9" x2="7" y2="9"/>
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>
          {currentFile ? basename(currentFile) : 'Cascade Docs'}
        </span>
      </div>

      {currentFile && (
        <span style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {currentFile.replace(/\\/g, '/').split('/').slice(0, -1).join('/')}
        </span>
      )}

      <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', WebkitAppRegion: 'no-drag' }}>
        <BarBtn onClick={onOpen} title="Open file">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5z"/>
          </svg>
        </BarBtn>
        <div style={{ width: 1, background: 'var(--border)', margin: '8px 2px' }} />
        {isMac ? <MacControls /> : <WinControls />}
      </div>
    </div>
  )
}

function MacControls() {
  return (
    <>
      <MacBtn onClick={() => window.docsAPI.minimize()} color="#ffbd2e" />
      <MacBtn onClick={() => window.docsAPI.maximize()} color="#27c93f" />
      <MacBtn onClick={() => window.docsAPI.close()} color="#ff5f56" />
    </>
  )
}

function WinControls() {
  return (
    <div style={{ display: 'flex', alignSelf: 'stretch', marginLeft: 4 }}>
      <WinCtrlBtn onClick={() => window.docsAPI.minimize()} title="Minimise" hoverColor="rgba(255,255,255,0.1)">
        <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
      </WinCtrlBtn>
      <WinCtrlBtn onClick={() => window.docsAPI.maximize()} title="Maximise" hoverColor="rgba(255,255,255,0.1)">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="0.5" y="0.5" width="9" height="9"/>
        </svg>
      </WinCtrlBtn>
      <WinCtrlBtn onClick={() => window.docsAPI.close()} title="Close" hoverColor="#c42b1c" closeBtn>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
          <path d="M1 1 L9 9 M9 1 L1 9"/>
        </svg>
      </WinCtrlBtn>
    </div>
  )
}

function WinCtrlBtn({ onClick, title, children, hoverColor, closeBtn }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 46, alignSelf: 'stretch', background: hov ? hoverColor : 'transparent',
        border: 'none', color: hov && closeBtn ? '#fff' : 'rgba(255,255,255,0.7)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s', flexShrink: 0,
      }}
    >{children}</button>
  )
}

function BarBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'transparent', border: 'none', color: 'var(--muted)',
      cursor: 'pointer', padding: '5px 8px', borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s, color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
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
