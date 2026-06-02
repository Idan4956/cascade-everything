import React, { useState, useEffect } from 'react'

const isMac = window.browserAPI?.platform === 'darwin'

export default function TitleBar({ tabs, activeTabId, onSelectTab, onNewTab, onCloseTab, onTabContextMenu }) {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const unsub = window.browserAPI?.onMaximized(setMaximized)
    return unsub
  }, [])

  return (
    <div style={{
      height: 40,
      display: 'flex',
      alignItems: 'flex-end',
      background: 'var(--chrome)',
      flexShrink: 0,
      WebkitAppRegion: 'drag',
      position: 'relative',
      zIndex: 10,
    }}>
      <style>{`
        @keyframes tabspin {
          to { transform: rotate(360deg) }
        }
        .tab-close-btn {
          opacity: 0;
          transition: opacity 0.12s, background 0.1s, color 0.1s;
        }
        .tab-row:hover .tab-close-btn,
        .tab-row.tab-active .tab-close-btn {
          opacity: 1;
        }
        .tab-close-btn:hover {
          background: rgba(255,255,255,0.18) !important;
          color: rgba(255,255,255,0.95) !important;
        }
      `}</style>

      {/* Mac traffic lights */}
      {isMac && (
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          display: 'flex', alignItems: 'center', paddingLeft: 12,
          WebkitAppRegion: 'no-drag', zIndex: 20,
        }}>
          <MacControls />
        </div>
      )}

      {/* Tab strip */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        flex: 1,
        overflow: 'hidden',
        WebkitAppRegion: 'no-drag',
        paddingLeft: isMac ? 82 : 8,
        paddingRight: isMac ? 8 : 0,
        height: '100%',
        gap: 2,
      }}>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            tab={tab}
            active={tab.id === activeTabId}
            onSelect={() => onSelectTab(tab.id)}
            onClose={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
            onContextMenu={(e) => { e.preventDefault(); onTabContextMenu?.(e, tab.id) }}
          />
        ))}

        {/* New tab button */}
        <NewTabBtn onClick={onNewTab} />
      </div>

      {/* Windows controls */}
      {!isMac && (
        <div style={{
          display: 'flex',
          alignSelf: 'stretch',
          flexShrink: 0,
          WebkitAppRegion: 'no-drag',
          marginLeft: 'auto',
        }}>
          <WinControls maximized={maximized} />
        </div>
      )}
    </div>
  )
}

function Tab({ tab, active, onSelect, onClose, onContextMenu }) {
  const [hov, setHov] = useState(false)

  if (tab.pinned) {
    return (
      <div
        className={`tab-row${active ? ' tab-active' : ''}`}
        onClick={onSelect}
        onContextMenu={onContextMenu}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        title={tab.title}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: active ? 33 : 31,
          width: 36, minWidth: 36, flexShrink: 0,
          padding: '0 6px',
          borderRadius: '8px 8px 0 0',
          background: active ? 'var(--surface)' : hov ? 'rgba(255,255,255,0.06)' : 'transparent',
          cursor: 'pointer',
          borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
          borderLeft: active ? '1px solid var(--border-mid)' : '1px solid transparent',
          borderRight: active ? '1px solid var(--border-mid)' : '1px solid transparent',
          borderBottom: 'none',
          marginBottom: active ? -1 : 0,
          alignSelf: 'flex-end',
          transition: 'background 0.1s',
          position: 'relative',
        }}
      >
        <div style={{ width: 14, height: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {tab.loading ? (
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid rgba(59,130,246,0.35)', borderTopColor: 'var(--accent)', animation: 'tabspin 0.7s linear infinite' }} />
          ) : tab.favicon ? (
            <img src={tab.favicon} width={14} height={14} style={{ borderRadius: 2 }} onError={e => { e.target.style.display = 'none' }} />
          ) : (
            <GlobeIcon color={active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)'} />
          )}
        </div>
        {/* Pin indicator */}
        <div style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', opacity: 0.8 }} />
      </div>
    )
  }

  return (
    <div
      className={`tab-row${active ? ' tab-active' : ''}`}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={tab.title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: active ? 33 : 31,
        maxWidth: 220,
        minWidth: 80,
        flex: '1 1 160px',
        padding: '0 10px',
        borderRadius: '8px 8px 0 0',
        background: active
          ? 'var(--surface)'
          : hov
            ? 'rgba(255,255,255,0.06)'
            : 'transparent',
        cursor: 'pointer',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
        borderLeft: active ? '1px solid var(--border-mid)' : '1px solid transparent',
        borderRight: active ? '1px solid var(--border-mid)' : '1px solid transparent',
        borderBottom: 'none',
        marginBottom: active ? -1 : 0,
        alignSelf: 'flex-end',
        transition: 'background 0.1s',
      }}
    >
      {/* Favicon or spinner */}
      <div style={{
        width: 14, height: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {tab.loading ? (
          <div style={{
            width: 12, height: 12,
            borderRadius: '50%',
            border: '1.5px solid rgba(59,130,246,0.35)',
            borderTopColor: 'var(--accent)',
            animation: 'tabspin 0.7s linear infinite',
          }} />
        ) : tab.favicon ? (
          <img
            src={tab.favicon}
            width={14}
            height={14}
            style={{ borderRadius: 2 }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <GlobeIcon color={active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)'} />
        )}
      </div>

      {/* Title */}
      <span style={{
        fontSize: 12,
        color: active ? 'var(--text)' : 'var(--muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
        fontWeight: active ? 500 : 400,
        letterSpacing: '-0.01em',
      }}>
        {tab.title || 'New Tab'}
      </span>

      {/* Close button */}
      <button
        className="tab-close-btn"
        onClick={onClose}
        title="Close  Ctrl+W"
        style={{
          width: 16, height: 16,
          borderRadius: 4,
          border: 'none',
          flexShrink: 0,
          background: 'transparent',
          color: 'rgba(255,255,255,0.55)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function NewTabBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title="New tab  Ctrl+T"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 'none',
        background: hov ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: hov ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        alignSelf: 'center',
        marginBottom: 4,
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <line x1="7" y1="1.5" x2="7" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="1.5" y1="7" x2="12.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function GlobeIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  )
}

function MacControls() {
  const [hov, setHov] = useState(false)
  const btns = [
    { color: '#ff5f56', shadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.25)', action: () => window.browserAPI?.close(), symbol: '×' },
    { color: '#ffbd2e', shadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.18)', action: () => window.browserAPI?.minimize(), symbol: '−' },
    { color: '#27c93f', shadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.18)', action: () => window.browserAPI?.maximize(), symbol: '+' },
  ]
  return (
    <div
      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {btns.map(({ color, shadow, action, symbol }, i) => (
        <button
          key={i}
          onClick={action}
          style={{
            width: 12, height: 12,
            borderRadius: '50%',
            border: 'none',
            background: color,
            boxShadow: shadow,
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitAppRegion: 'no-drag',
            fontSize: 8,
            fontWeight: 900,
            color: 'rgba(0,0,0,0.65)',
            lineHeight: 1,
            transition: 'filter 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.9)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = '' }}
        >
          {hov ? symbol : ''}
        </button>
      ))}
    </div>
  )
}

function WinControls({ maximized }) {
  const [hov, setHov] = useState(null)
  const btns = [
    {
      id: 'min',
      title: 'Minimize',
      action: () => window.browserAPI?.minimize(),
      icon: (
        <svg width="10" height="1" viewBox="0 0 10 1">
          <line x1="0" y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: 'max',
      title: maximized ? 'Restore' : 'Maximize',
      action: () => window.browserAPI?.maximize(),
      icon: maximized ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="2" y="2" width="7" height="7" rx="0.5" stroke="currentColor" strokeWidth="1" />
          <path d="M1 7V1h6" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="0.5" y="0.5" width="9" height="9" rx="0.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      ),
    },
    {
      id: 'close',
      title: 'Close',
      action: () => window.browserAPI?.close(),
      icon: (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <line x1="0.5" y1="0.5" x2="9.5" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line x1="9.5" y1="0.5" x2="0.5" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {btns.map(({ id, title, action, icon }) => (
        <button
          key={id}
          onClick={action}
          title={title}
          onMouseEnter={() => setHov(id)}
          onMouseLeave={() => setHov(null)}
          style={{
            width: 46,
            height: '100%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.1s',
            background: hov === id
              ? (id === 'close' ? '#c42b1c' : 'rgba(255,255,255,0.1)')
              : 'transparent',
            color: (hov === id && id === 'close') ? '#fff' : 'rgba(255,255,255,0.65)',
            WebkitAppRegion: 'no-drag',
          }}
        >
          {icon}
        </button>
      ))}
    </>
  )
}
