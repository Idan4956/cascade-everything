import React, { useState, useEffect } from 'react'

const isMac = window.browserAPI?.platform === 'darwin'

function MacControls() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 16, flexShrink: 0 }}>
      {[['#ff5f56', '#e0443e'], ['#ffbd2e', '#dea123'], ['#27c93f', '#1aab29']].map(([bg, hover], i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg, cursor: 'pointer', flexShrink: 0 }} />
      ))}
    </div>
  )
}

function WinControls() {
  const [hov, setHov] = useState(null)
  return (
    <div style={{ display: 'flex', height: '100%', flexShrink: 0, marginLeft: 'auto' }}>
      {[
        { id: 'min', action: () => window.browserAPI?.minimize(), icon: <rect x="4" y="11" width="16" height="1.5" fill="currentColor" /> },
        { id: 'max', action: () => window.browserAPI?.maximize(), icon: <rect x="4" y="4" width="16" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /> },
        { id: 'close', action: () => window.browserAPI?.close(), icon: <><line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
      ].map(({ id, action, icon }) => (
        <div key={id} onClick={action}
          onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}
          style={{
            width: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: hov === id ? (id === 'close' ? '#c42b1c' : 'rgba(255,255,255,0.1)') : 'transparent',
            color: 'var(--text)', cursor: 'pointer', transition: 'background 0.1s',
          }}>
          <svg width="24" height="24" viewBox="0 0 24 24">{icon}</svg>
        </div>
      ))}
    </div>
  )
}

export default function TitleBar({ tabs, activeTabId, onSelectTab, onNewTab, onCloseTab }) {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const unsub = window.browserAPI?.onMaximized(setMaximized)
    return unsub
  }, [])

  return (
    <div
      style={{
        height: 40,
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      }}
    >
      {isMac && <MacControls />}

      {/* Tab strip */}
      <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, overflow: 'hidden', WebkitAppRegion: 'no-drag', gap: 2, paddingLeft: isMac ? 8 : 4, paddingRight: 4, paddingBottom: 0 }}>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            tab={tab}
            active={tab.id === activeTabId}
            onSelect={() => onSelectTab(tab.id)}
            onClose={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
          />
        ))}
        <button
          onClick={onNewTab}
          title="New tab"
          style={{
            width: 28, height: 28, borderRadius: 6, border: 'none', flexShrink: 0,
            background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, lineHeight: 1, alignSelf: 'center',
          }}>+</button>
      </div>

      {!isMac && <WinControls />}
    </div>
  )
}

function Tab({ tab, active, onSelect, onClose }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        height: 32, maxWidth: 220, minWidth: 80, flex: '1 1 160px',
        padding: '0 8px', borderRadius: '6px 6px 0 0',
        background: active ? 'var(--bg)' : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        borderTop: active ? '1px solid var(--border)' : '1px solid transparent',
        borderLeft: active ? '1px solid var(--border)' : '1px solid transparent',
        borderRight: active ? '1px solid var(--border)' : '1px solid transparent',
        marginBottom: active ? '-1px' : 0,
        transition: 'background 0.1s',
        flexShrink: 0,
      }}>
      {/* Favicon */}
      {tab.loading ? (
        <div style={{ width: 14, height: 14, flexShrink: 0, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      ) : tab.favicon ? (
        <img src={tab.favicon} width={14} height={14} style={{ borderRadius: 2, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )}
      <span style={{ fontSize: 12, color: active ? 'var(--text)' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {tab.title || 'New Tab'}
      </span>
      <button
        onClick={onClose}
        style={{
          width: 18, height: 18, borderRadius: 4, border: 'none', flexShrink: 0,
          background: hov || active ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, lineHeight: 1, opacity: hov || active ? 1 : 0,
          transition: 'opacity 0.1s',
        }}>×</button>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
