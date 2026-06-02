import React, { useState, useEffect } from 'react'

const QUICK_LINKS = [
  { label: 'Google', url: 'https://www.google.com', bg: '#4285f4', initial: 'G' },
  { label: 'YouTube', url: 'https://www.youtube.com', bg: '#ff0000', initial: '▶' },
  { label: 'GitHub', url: 'https://github.com', bg: '#24292e', initial: null, icon: 'github' },
  { label: 'Reddit', url: 'https://www.reddit.com', bg: '#ff4500', initial: null, icon: 'reddit' },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org', bg: '#636466', initial: 'W' },
  { label: 'X / Twitter', url: 'https://www.x.com', bg: '#000000', initial: null, icon: 'x' },
  { label: 'Stack Overflow', url: 'https://stackoverflow.com', bg: '#f48024', initial: null, icon: 'so' },
  { label: 'MDN', url: 'https://developer.mozilla.org', bg: '#1b1b1b', initial: null, icon: 'mdn' },
]

function SiteIcon({ site }) {
  if (site.icon === 'github') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    )
  }
  if (site.icon === 'reddit') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    )
  }
  if (site.icon === 'x') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }
  if (site.icon === 'so') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.133v6.404h15.009zm-2.89-5.76l.421-2.073-8.513-1.787-.421 2.073 8.513 1.787zm1.276-4.96l.84-1.96-7.909-3.36-.84 1.962 7.909 3.358zm2.52-4.727l1.26-1.68-6.72-5.04-1.26 1.68 6.72 5.04zM4.194 18.001v-2.134h8.538v2.134H4.194z" />
      </svg>
    )
  }
  if (site.icon === 'mdn') {
    return (
      <span style={{ fontSize: 15, fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>MDN</span>
    )
  }
  return (
    <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{site.initial}</span>
  )
}

function formatClock() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateStr() {
  return new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function NewTabPage({ onNavigate, onOpenSettings, background }) {
  const [query, setQuery] = useState('')
  const [time, setTime] = useState(formatClock)
  const [dateStr] = useState(formatDateStr)

  useEffect(() => {
    const tick = () => setTime(formatClock())
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) onNavigate(query.trim())
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: '12vh',
      background: background || 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%), var(--bg)',
      padding: '12vh 32px 32px',
      overflowY: 'auto',
      userSelect: 'none',
      position: 'relative',
    }}>
      {/* Settings button */}
      {onOpenSettings && (
        <SettingsBtn onClick={onOpenSettings} />
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 620,
        gap: 0,
      }}>
        {/* Clock */}
        <div style={{
          fontSize: 52,
          fontWeight: 200,
          color: 'var(--text)',
          letterSpacing: '-2px',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {time}
        </div>

        {/* Date */}
        <div style={{
          marginTop: 8,
          fontSize: 14,
          color: 'var(--muted)',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}>
          {dateStr}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ width: '100%', marginTop: 36 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: 52,
            background: 'var(--surface2)',
            border: '1px solid var(--border-mid)',
            borderRadius: 26,
            padding: '0 20px',
            transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
          }}
            onFocusCapture={e => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
              e.currentTarget.style.background = 'var(--surface3)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'
            }}
            onBlurCapture={e => {
              e.currentTarget.style.borderColor = 'var(--border-mid)'
              e.currentTarget.style.background = 'var(--surface2)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search or type a URL"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 15,
                userSelect: 'text',
              }}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} style={{
                width: 20, height: 20,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Quick links grid */}
        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: 32,
          width: '100%',
        }}>
          {QUICK_LINKS.map((site) => (
            <QuickLink key={site.url} site={site} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title="Settings"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 10,
        border: 'none',
        background: hov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        color: hov ? 'var(--text)' : 'var(--muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
  )
}

function QuickLink({ site, onNavigate }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={() => onNavigate(site.url)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={site.label}
      style={{
        width: 76,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 4px',
        borderRadius: 12,
        transform: hov ? 'scale(1.06)' : 'scale(1)',
        transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: site.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: hov
          ? `0 6px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)`
          : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.15s',
        flexShrink: 0,
      }}>
        <SiteIcon site={site} />
      </div>
      <span style={{
        fontSize: 11,
        color: hov ? 'var(--text)' : 'var(--muted)',
        fontWeight: 400,
        textAlign: 'center',
        lineHeight: 1.2,
        transition: 'color 0.15s',
        whiteSpace: 'nowrap',
      }}>
        {site.label}
      </span>
    </button>
  )
}
