import React, { useState } from 'react'

const SEARCH_ENGINES = [
  { id: 'google', label: 'Google' },
  { id: 'bing', label: 'Bing' },
  { id: 'duckduckgo', label: 'DuckDuckGo' },
  { id: 'brave', label: 'Brave Search' },
]

const BG_PRESETS = [
  { id: '', label: 'Default', bg: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%), #131313' },
  { id: 'midnight', label: 'Midnight', bg: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 60%), #0a0a0f' },
  { id: 'forest', label: 'Forest', bg: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 60%), #080f0a' },
  { id: 'crimson', label: 'Crimson', bg: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.15) 0%, transparent 60%), #0f0808' },
  { id: 'solar', label: 'Solar', bg: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 60%), #0f0c08' },
  { id: 'cosmic', label: 'Cosmic', bg: 'radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.15) 0%, transparent 60%), #0f0a0f' },
  { id: 'ocean', label: 'Ocean', bg: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.15) 0%, transparent 60%), #080c0f' },
  { id: 'void', label: 'Void', bg: '#080808' },
]

const ACCENT_PRESETS = ['#3b82f6','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#f97316','#ffffff']

export default function SettingsPage({
  settings, onSave, onClose,
  adBlockEnabled, adBlockCount, adBlockDomains,
  onToggleAdBlock, onClearHistory, onClearBookmarks,
}) {
  const [local, setLocal] = useState(settings || { searchEngine: 'google' })
  const [historyDone, setHistoryDone] = useState(false)
  const [bmDone, setBmDone] = useState(false)
  const [activeSection, setActiveSection] = useState('general')

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

      {/* Body: sidebar + content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar nav */}
        <div style={{ width: 160, flexShrink: 0, borderRight: '1px solid var(--border)', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { id: 'general', label: 'General', icon: '⚙' },
            { id: 'appearance', label: 'Appearance', icon: '🎨' },
            { id: 'adblock', label: 'Ad Blocker', icon: '🛡' },
            { id: 'privacy', label: 'Privacy', icon: '🔒' },
            { id: 'about', label: 'About', icon: 'ℹ' },
          ].map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8, border: 'none',
              background: activeSection === s.id ? 'var(--accent-soft)' : 'transparent',
              color: activeSection === s.id ? 'var(--accent)' : 'var(--muted)',
              fontSize: 12.5, fontWeight: activeSection === s.id ? 600 : 400,
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'all 0.1s',
            }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 24 }}>

            {activeSection === 'general' && <>
              <SettingSection title="Search Engine">
                <SettingRow label="Default search engine" desc="Used for address bar searches" last>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {SEARCH_ENGINES.map(se => (
                      <ChipBtn key={se.id} active={local.searchEngine === se.id} onClick={() => update('searchEngine', se.id)}>{se.label}</ChipBtn>
                    ))}
                  </div>
                </SettingRow>
              </SettingSection>

              <SettingSection title="Browsing">
                <SettingRow label="Force dark mode" desc="Request dark color scheme from all websites">
                  <Toggle enabled={!!local.forceDarkMode} onToggle={(v) => update('forceDarkMode', v)} />
                </SettingRow>
                <SettingRow label="GX Sounds" desc="Sound effects for tab events and navigation" last>
                  <Toggle enabled={local.soundsEnabled !== false} onToggle={(v) => update('soundsEnabled', v)} />
                </SettingRow>
              </SettingSection>
            </>}

            {activeSection === 'appearance' && <>
              <SettingSection title="Theme Color">
                <SettingRow label="Accent color" desc="Changes highlights, active states, and focus rings" last>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {ACCENT_PRESETS.map(c => (
                      <button key={c} onClick={() => update('accentColor', c)} style={{
                        width: 22, height: 22, borderRadius: '50%', border: `2px solid ${local.accentColor === c ? '#fff' : 'transparent'}`,
                        background: c, cursor: 'pointer', padding: 0, flexShrink: 0,
                        boxShadow: local.accentColor === c ? `0 0 0 1px ${c}` : 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }} />
                    ))}
                    <input
                      type="color"
                      value={local.accentColor || '#3b82f6'}
                      onChange={e => update('accentColor', e.target.value)}
                      title="Custom color"
                      style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    />
                  </div>
                </SettingRow>
              </SettingSection>

              <SettingSection title="New Tab Background">
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {BG_PRESETS.map(p => (
                      <button key={p.id} onClick={() => update('newTabBackground', p.bg)}
                        title={p.label}
                        style={{
                          aspectRatio: '16/10', borderRadius: 8,
                          border: `2px solid ${local.newTabBackground === p.bg || (!local.newTabBackground && p.id === '') ? 'var(--accent)' : 'transparent'}`,
                          background: p.bg, cursor: 'pointer', padding: 0,
                          position: 'relative', overflow: 'hidden',
                          transition: 'border-color 0.15s',
                        }}>
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          padding: '3px 5px', fontSize: 9, color: 'rgba(255,255,255,0.7)',
                          background: 'rgba(0,0,0,0.4)',
                          textAlign: 'center', fontWeight: 600,
                        }}>{p.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </SettingSection>
            </>}

            {activeSection === 'adblock' && <>
              <SettingSection title="Ad Blocker">
                <SettingRow label="Block ads & trackers" desc={
                  adBlockDomains > 0
                    ? `Active against ${adBlockDomains.toLocaleString()} known domains`
                    : 'Loading domain list…'
                }>
                  <Toggle enabled={adBlockEnabled} onToggle={onToggleAdBlock} />
                </SettingRow>
                <SettingRow label="Blocked this session" last>
                  <span style={{ fontSize: 24, fontWeight: 700, color: adBlockEnabled ? '#22c55e' : 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {adBlockCount.toLocaleString()}
                  </span>
                </SettingRow>
              </SettingSection>
            </>}

            {activeSection === 'privacy' && <>
              <SettingSection title="Data">
                <SettingRow label="Browsing history" desc="Remove all saved browsing history">
                  <DangerBtn done={historyDone} doneLabel="Cleared!" label="Clear history" onClick={() => {
                    onClearHistory(); setHistoryDone(true); setTimeout(() => setHistoryDone(false), 2500)
                  }} />
                </SettingRow>
                <SettingRow label="Bookmarks" desc="Delete all saved bookmarks" last>
                  <DangerBtn done={bmDone} doneLabel="Cleared!" label="Clear bookmarks" onClick={() => {
                    onClearBookmarks(); setBmDone(true); setTimeout(() => setBmDone(false), 2500)
                  }} />
                </SettingRow>
              </SettingSection>
            </>}

            {activeSection === 'about' && <>
              <SettingSection title="About">
                <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `linear-gradient(135deg, ${local.accentColor || '#3b82f6'} 0%, ${local.accentColor || '#2563eb'}cc 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Cascade Browser</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Part of the Cascade Suite</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>Version 1.0.0</div>
                  </div>
                </div>
              </SettingSection>
            </>}

          </div>
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

function Toggle({ enabled, onToggle }) {
  return (
    <div
      onClick={() => onToggle?.(!enabled)}
      style={{
        width: 40, height: 22,
        borderRadius: 11,
        background: enabled ? '#22c55e' : 'rgba(255,255,255,0.15)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: enabled ? 21 : 3,
        width: 16, height: 16,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
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

function ChipBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        borderRadius: 6,
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
        color: active ? 'var(--accent)' : 'var(--muted)',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        userSelect: 'none',
      }}
    >
      {children}
    </button>
  )
}
