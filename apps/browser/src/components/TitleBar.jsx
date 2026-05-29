import React, { useState, useEffect } from 'react'

const isMac = window.browserAPI?.platform === 'darwin'

export default function TitleBar({ tabs, activeTabId, onSelectTab, onNewTab, onCloseTab }) {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const unsub = window.browserAPI?.onMaximized(setMaximized)
    return unsub
  }, [])

  return (
    <div style={{
      height: 40,
      display: 'flex',
      alignItems: 'stretch',
      background: 'rgba(15,15,19,0.98)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      WebkitAppRegion: 'drag',
    }}>
      {/* Left anchor: Mac traffic-light room or logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        paddingLeft: isMac ? 76 : 10, paddingRight: 6,
        WebkitAppRegion: 'no-drag',
      }}>
        {isMac && <MacControls />}
        <div style={{
          width: 20, height: 20, borderRadius: 5, flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>
          </svg>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', flex: 1, overflow: 'hidden',
        WebkitAppRegion: 'no-drag', gap: 1,
        paddingLeft: 2, paddingRight: 2, paddingBottom: 0,
      }}>
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
          title="New tab  Ctrl+T"
          style={{
            width: 28, height: 28, borderRadius: 6, border: 'none', flexShrink: 0,
            background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, lineHeight: 1, alignSelf: 'center',
            transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
        >+</button>
      </div>

      {/* Windows controls */}
      {!isMac && (
        <div style={{ display: 'flex', alignSelf: 'stretch', flexShrink: 0, WebkitAppRegion: 'no-drag' }}>
          <WinControls maximized={maximized} />
        </div>
      )}
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
      title={tab.title}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        height: 32, maxWidth: 200, minWidth: 72, flex: '1 1 148px',
        padding: '0 8px', borderRadius: '7px 7px 0 0',
        background: active ? 'var(--bg)' : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        cursor: 'pointer', overflow: 'hidden',
        border: `1px solid ${active ? 'var(--border)' : 'transparent'}`,
        borderBottom: active ? '1px solid var(--bg)' : '1px solid transparent',
        marginBottom: active ? '-1px' : 0,
        transition: 'background 0.12s',
        flexShrink: 0,
      }}>
      <div style={{ width: 14, height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {tab.loading ? (
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            border: '1.5px solid var(--accent)', borderTopColor: 'transparent',
            animation: 'tbspin 0.7s linear infinite',
          }} />
        ) : tab.favicon ? (
          <img src={tab.favicon} width={14} height={14} style={{ borderRadius: 2 }}
            onError={e => { e.target.style.display = 'none' }} />
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke={active ? 'var(--muted)' : 'rgba(136,136,153,0.5)'} strokeWidth="1.5">
            <circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>
          </svg>
        )}
      </div>
      <span style={{
        fontSize: 12, color: active ? 'var(--text)' : 'var(--muted)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
      }}>
        {tab.title || 'New Tab'}
      </span>
      <button
        onClick={onClose}
        title="Close  Ctrl+W"
        style={{
          width: 17, height: 17, borderRadius: 4, border: 'none', flexShrink: 0,
          background: (hov || active) ? 'rgba(255,255,255,0.1)' : 'transparent',
          color: 'var(--muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (hov || active) ? 1 : 0, transition: 'opacity 0.12s',
          fontSize: 13, lineHeight: 1,
        }}>×</button>
      <style>{`@keyframes tbspin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function MacControls() {
  const btns = [
    { color: '#ff5f56', action: () => window.browserAPI?.close() },
    { color: '#ffbd2e', action: () => window.browserAPI?.minimize() },
    { color: '#27c93f', action: () => window.browserAPI?.maximize() },
  ]
  return (
    <div style={{
      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
      display: 'flex', gap: 7, alignItems: 'center',
    }}>
      {btns.map(({ color, action }, i) => (
        <button key={i} onClick={action} style={{
          width: 12, height: 12, borderRadius: '50%', border: 'none',
          background: color, cursor: 'pointer', flexShrink: 0,
          opacity: 0.85, transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
        />
      ))}
    </div>
  )
}

function WinControls({ maximized }) {
  const [hov, setHov] = useState(null)
  const btns = [
    {
      id: 'min', title: 'Minimize', action: () => window.browserAPI?.minimize(),
      icon: <rect x="4" y="11.5" width="16" height="1" rx="0.5" fill="currentColor" />,
    },
    {
      id: 'max', title: maximized ? 'Restore' : 'Maximize', action: () => window.browserAPI?.maximize(),
      icon: maximized
        ? <><rect x="5" y="7" width="11" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M8 7V5.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H17" fill="none" stroke="currentColor" strokeWidth="1.2"/></>
        : <rect x="5" y="5" width="14" height="14" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />,
    },
    {
      id: 'close', title: 'Close', action: () => window.browserAPI?.close(),
      icon: <><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">/</line></>,
    },
  ]
  return (
    <>
      {btns.map(({ id, title, action, icon }) => (
        <button key={id} onClick={action} title={title}
          onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}
          style={{
            width: 46, height: '100%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s',
            background: hov === id ? (id === 'close' ? '#c42b1c' : 'rgba(255,255,255,0.1)') : 'transparent',
            color: hov === id && id === 'close' ? '#fff' : 'rgba(255,255,255,0.75)',
          }}>
          <svg width="24" height="24" viewBox="0 0 24 24">{icon}</svg>
        </button>
      ))}
    </>
  )
}
