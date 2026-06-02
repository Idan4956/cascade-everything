import React, { useState } from 'react'

const SEARCH_ENGINES = [
  { id: 'google', label: 'Google' },
  { id: 'bing', label: 'Bing' },
  { id: 'duckduckgo', label: 'DuckDuckGo' },
  { id: 'brave', label: 'Brave Search' },
]

export default function SettingsPage({ settings, onSave, onClose, onClearHistory, onClearBookmarks }) {
  const [local, setLocal] = useState(settings || { searchEngine: 'google' })
  const [historyDone, setHistoryDone] = useState(false)
  const [bmDone, setBmDone] = useState(false)

  const update = (key, val) => {
    const next = { ...local, [key]: val }
    setLocal(next)
    onSave(next)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--bg)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '18px 28px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <IconBtn onClick={onClose} title="Back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </IconBtn>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Settings</h1>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* General */}
          <SettingSection title="General">
            <SettingRow label="Search engine" desc="Choose your default search engine" last>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {SEARCH_ENGINES.map(se => (
                  <button
                    key={se.id}
                    onClick={() => update('searchEngine', se.id)}
                    style={{
                      padding: '5px 13px',
                      borderRadius: 7,
                      border: `1px solid ${local.searchEngine === se.id ? 'var(--accent)' : 'var(--border-mid)'}`,
                      background: local.searchEngine === se.id ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
                      color: local.searchEngine === se.id ? 'var(--accent)' : 'var(--text)',
                      fontSize: 12,
                      fontWeight: local.searchEngine === se.id ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                      userSelect: 'none',
                    }}
                  >
                    {se.label}
                  </button>
                ))}
              </div>
            </SettingRow>
          </SettingSection>

          {/* Privacy */}
          <SettingSection title="Privacy & Data">
            <SettingRow label="Browsing history" desc="Remove all saved browsing history">
              <DangerBtn done={historyDone} doneLabel="Cleared!" label="Clear history" onClick={() => {
                onClearHistory()
                setHistoryDone(true)
                setTimeout(() => setHistoryDone(false), 2500)
              }} />
            </SettingRow>
            <SettingRow label="Bookmarks" desc="Delete all saved bookmarks permanently" last>
              <DangerBtn done={bmDone} doneLabel="Cleared!" label="Clear bookmarks" onClick={() => {
                onClearBookmarks()
                setBmDone(true)
                setTimeout(() => setBmDone(false), 2500)
              }} />
            </SettingRow>
          </SettingSection>

          {/* About */}
          <SettingSection title="About">
            <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Cascade Browser</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Part of the Cascade Suite · Version 1.0.0</div>
              </div>
            </div>
          </SettingSection>

        </div>
      </div>
    </div>
  )
}

function SettingSection({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 700, color: 'var(--muted)',
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
      }}>
        {title}
      </div>
      <div style={{
        background: 'var(--surface2)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, desc, children, last }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '14px 20px',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function DangerBtn({ label, doneLabel, done, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={done}
      style={{
        padding: '6px 14px',
        borderRadius: 7,
        border: done ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(239,68,68,0.3)',
        background: done ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
        color: done ? '#22c55e' : '#ef4444',
        fontSize: 12,
        fontWeight: 600,
        cursor: done ? 'default' : 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        userSelect: 'none',
      }}
      onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'rgba(239,68,68,0.16)' }}
      onMouseLeave={e => { if (!done) e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
    >
      {done ? doneLabel : label}
    </button>
  )
}

function IconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none', flexShrink: 0,
        background: 'rgba(255,255,255,0.06)', color: 'var(--muted)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--muted)' }}
    >
      {children}
    </button>
  )
}
