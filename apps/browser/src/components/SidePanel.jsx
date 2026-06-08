import React, { useState, useMemo } from 'react'

const SOCIAL_APPS = [
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com', color: '#25d366', icon: 'W' },
  { id: 'telegram', name: 'Telegram', url: 'https://web.telegram.org', color: '#2aabee', icon: 'T' },
  { id: 'discord', name: 'Discord', url: 'https://discord.com/app', color: '#5865f2', icon: 'D' },
  { id: 'messenger', name: 'Messenger', url: 'https://www.messenger.com', color: '#0084ff', icon: 'M' },
  { id: 'slack', name: 'Slack', url: 'https://app.slack.com', color: '#e01e5a', icon: 'S' },
  { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com', color: '#ff4500', icon: 'R' },
  { id: 'twitter', name: 'X / Twitter', url: 'https://x.com', color: '#fff', icon: 'X' },
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', color: '#e1306c', icon: 'Ig' },
]

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000
  const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (dStart === today) return 'Today'
  if (dStart === yesterday) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

function TagChip({ tag, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '3px 12px',
        borderRadius: 20,
        border: 'none',
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
        background: active ? 'var(--accent)' : hov ? 'rgba(255,255,255,0.1)' : 'var(--surface2)',
        color: active ? '#fff' : hov ? 'var(--text)' : 'var(--muted)',
      }}
    >
      {tag}
    </button>
  )
}

function BookmarkItem({ bm, onNavigate, onNewTab, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [titleVal, setTitleVal] = useState(bm.title)
  const [tagsVal, setTagsVal] = useState((bm.tags || []).join(', '))
  const [hov, setHov] = useState(false)

  const handleSave = () => {
    onUpdate({
      ...bm,
      title: titleVal.trim() || bm.title,
      tags: tagsVal.split(',').map(t => t.trim()).filter(Boolean),
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(59,130,246,0.04)',
      }}>
        <SidePanelInput
          value={titleVal}
          onChange={e => setTitleVal(e.target.value)}
          placeholder="Bookmark name"
          autoFocus
        />
        <div style={{ height: 6 }} />
        <SidePanelInput
          value={tagsVal}
          onChange={e => setTagsVal(e.target.value)}
          placeholder="Tags: work, reference, ..."
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button onClick={handleSave} style={{
            flex: 1, padding: '5px 0', borderRadius: 6, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>Save</button>
          <button onClick={() => setEditing(false)} style={{
            flex: 1, padding: '5px 0', borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--muted)', fontSize: 11, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onNavigate(bm.url)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        minHeight: 44,
        padding: '8px 14px',
        borderBottom: '1px solid var(--border)',
        background: hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      {/* Favicon */}
      <div style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {bm.favicon ? (
          <img src={bm.favicon} width={14} height={14} style={{ borderRadius: 2 }}
            onError={e => { e.target.style.display = 'none' }} />
        ) : (
          <GlobeSmall />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {bm.title || bm.url}
        </div>
        {bm.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
            {bm.tags.map(t => (
              <span key={t} style={{
                fontSize: 10, padding: '1px 7px', borderRadius: 20,
                background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600,
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Hover actions */}
      {hov && (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <ActionBtn title="Edit" onClick={e => { e.stopPropagation(); setEditing(true); setTitleVal(bm.title); setTagsVal((bm.tags || []).join(', ')) }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Open in new tab" onClick={e => { e.stopPropagation(); onNewTab(bm.url) }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Remove" danger onClick={e => { e.stopPropagation(); onRemove(bm.url) }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </ActionBtn>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ onClick, title, danger, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 24, height: 24, borderRadius: 5, border: 'none',
        background: hov ? (danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.1)') : 'transparent',
        color: hov && danger ? '#ef4444' : 'var(--muted)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  )
}

function HistoryItem({ item, onNavigate, onNewTab }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onNavigate(item.url)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        minHeight: 44,
        padding: '7px 14px',
        borderBottom: '1px solid var(--border)',
        background: hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <GlobeSmall />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: 'var(--text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.title || item.url}
        </div>
        <div style={{
          fontSize: 10, color: 'var(--muted)', marginTop: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.url}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>{formatTime(item.time)}</span>
        {hov && (
          <ActionBtn title="Open in new tab" onClick={e => { e.stopPropagation(); onNewTab(item.url) }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </ActionBtn>
        )}
      </div>
    </div>
  )
}

function GlobeSmall() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  )
}

function SidePanelInput({ value, onChange, placeholder, autoFocus }) {
  return (
    <input
      autoFocus={autoFocus}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--border-mid)',
        borderRadius: 7,
        padding: '5px 9px',
        color: 'var(--text)',
        fontSize: 12,
        outline: 'none',
        userSelect: 'text',
        boxSizing: 'border-box',
      }}
    />
  )
}

function SessionCard({ session, onRestore, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        marginBottom: 8,
        transition: 'background 0.1s',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{session.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {new Date(session.created).toLocaleDateString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} · {session.tabs.length} tab{session.tabs.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={onDelete} style={{
          width: 20, height: 20, borderRadius: 5, border: 'none',
          background: 'rgba(239,68,68,0.12)', color: '#ef4444',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hov ? 1 : 0, transition: 'opacity 0.1s', flexShrink: 0,
        }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/* Favicons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: hov ? 8 : 0, flexWrap: 'wrap' }}>
        {session.tabs.slice(0, 6).map((t, i) => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {t.favicon ? (
              <img src={t.favicon} width={12} height={12} style={{ borderRadius: 2 }} onError={e => e.target.style.display='none'} />
            ) : (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
            )}
          </div>
        ))}
        {session.tabs.length > 6 && <span style={{ fontSize: 10, color: 'var(--muted)', alignSelf: 'center' }}>+{session.tabs.length - 6}</span>}
      </div>
      {hov && (
        <button onClick={onRestore} style={{
          width: '100%', padding: '6px 0', borderRadius: 7, border: 'none',
          background: 'var(--accent)', color: '#fff',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'filter 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.filter='brightness(1.1)'}
        onMouseLeave={e => e.currentTarget.style.filter=''}
        >Restore all tabs</button>
      )}
    </div>
  )
}

export default function SidePanel({
  view, bookmarks, history, onNavigate, onNewTab,
  onBookmarkUpdate, onBookmarkRemove, onClearHistory, onClose,
  sessions, onSaveSession, onRestoreSession, onDeleteSession,
}) {
  const [bmSearch, setBmSearch] = useState('')
  const [activeTags, setActiveTags] = useState([])
  const [histSearch, setHistSearch] = useState('')
  const [socialApp, setSocialApp] = useState(SOCIAL_APPS[0].id)
  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState('')

  const allTags = useMemo(() => {
    const tags = new Set()
    bookmarks.forEach(b => (b.tags || []).forEach(t => tags.add(t)))
    return [...tags].sort()
  }, [bookmarks])

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const q = bmSearch.toLowerCase()
      const matchesSearch = !q || (b.title || '').toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
      const matchesTags = activeTags.length === 0 || activeTags.some(t => (b.tags || []).includes(t))
      return matchesSearch && matchesTags
    })
  }, [bookmarks, bmSearch, activeTags])

  const groupedHistory = useMemo(() => {
    const q = histSearch.toLowerCase()
    const filtered = history.filter(h =>
      !q || (h.title || '').toLowerCase().includes(q) || h.url.toLowerCase().includes(q)
    )
    const groups = {}
    filtered.forEach(h => {
      const label = formatDate(h.time)
      if (!groups[label]) groups[label] = []
      groups[label].push(h)
    })
    return Object.entries(groups)
  }, [history, histSearch])

  const toggleTag = (tag) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  return (
    <div style={{
      width: view === 'social' ? 360 : view === 'sessions' ? 300 : 280,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 8,
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          {view === 'bookmarks' ? (
            <svg width="15" height="15" viewBox="0 0 24 24"
              fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : view === 'social' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          ) : view === 'sessions' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
            {view === 'bookmarks' ? 'Bookmarks' : view === 'social' ? 'Messengers' : view === 'sessions' ? 'Sessions' : 'History'}
          </span>
        </div>

        {/* Action button */}
        {view === 'history' && (
          <button
            onClick={onClearHistory}
            title="Clear history"
            style={{
              padding: '3px 9px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500,
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            Clear
          </button>
        )}

        {view === 'sessions' && (
          saving ? (
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <input
                autoFocus
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onSaveSession(saveName); setSaving(false); setSaveName('') }
                  if (e.key === 'Escape') { setSaving(false); setSaveName('') }
                }}
                placeholder="Session name…"
                style={{ width: 120, height: 24, borderRadius: 6, border: '1px solid var(--border-mid)', background: 'var(--surface3)', color: 'var(--text)', fontSize: 11, padding: '0 8px', outline: 'none', userSelect: 'text' }}
              />
              <button onClick={() => { onSaveSession(saveName); setSaving(false); setSaveName('') }}
                style={{ height: 24, padding: '0 8px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Save</button>
            </div>
          ) : (
            <button onClick={() => setSaving(true)} title="Save current tabs as session"
              style={{ height: 26, padding: '0 10px', borderRadius: 7, border: '1px solid var(--border-mid)', background: 'rgba(255,255,255,0.06)', color: 'var(--text)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save session
            </button>
          )
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: 26, height: 26,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s, color 0.1s',
            flexShrink: 0,
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

      {/* Social panel */}
      {view === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* App switcher row */}
          <div style={{
            display: 'flex', gap: 6, padding: '10px 12px',
            flexShrink: 0, borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            {SOCIAL_APPS.map(app => (
              <button
                key={app.id}
                onClick={() => setSocialApp(app.id)}
                title={app.name}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: socialApp === app.id ? `2px solid ${app.color}` : '2px solid transparent',
                  background: socialApp === app.id ? `${app.color}22` : 'rgba(255,255,255,0.06)',
                  color: socialApp === app.id ? app.color : 'var(--muted)',
                  fontSize: app.icon.length > 1 ? 9 : 11,
                  fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                {app.icon}
              </button>
            ))}
          </div>
          {/* Webview */}
          <webview
            src={SOCIAL_APPS.find(a => a.id === socialApp)?.url}
            partition="persist:social"
            allowpopups="true"
            style={{ flex: 1, width: '100%', minHeight: 0 }}
          />
        </div>
      )}

      {/* Sessions panel */}
      {view === 'sessions' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
          {(!sessions || sessions.length === 0) ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: 160, gap: 10,
            }}>
              <div style={{ opacity: 0.2 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/><rect x="2" y="17" width="20" height="4" rx="1"/>
                </svg>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
                No saved sessions. Click the save button to snapshot your current tabs.
              </span>
            </div>
          ) : (
            sessions.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                onRestore={() => onRestoreSession(s)}
                onDelete={() => onDeleteSession(s.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Search + tags + list — bookmarks & history only */}
      {view !== 'social' && view !== 'sessions' && (
        <>
          <div style={{ padding: '9px 12px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <svg
                style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={view === 'bookmarks' ? bmSearch : histSearch}
                onChange={e => view === 'bookmarks' ? setBmSearch(e.target.value) : setHistSearch(e.target.value)}
                placeholder={`Search ${view}…`}
                style={{
                  width: '100%',
                  padding: '6px 9px 6px 28px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text)',
                  fontSize: 12,
                  outline: 'none',
                  userSelect: 'text',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.4)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
              />
            </div>
          </div>

          {/* Tag chips — bookmarks only */}
          {view === 'bookmarks' && allTags.length > 0 && (
            <div style={{
              padding: '8px 12px 8px',
              flexShrink: 0,
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border)',
            }}>
              <TagChip tag="All" active={activeTags.length === 0} onClick={() => setActiveTags([])} />
              {allTags.map(t => (
                <TagChip key={t} tag={t} active={activeTags.includes(t)} onClick={() => toggleTag(t)} />
              ))}
            </div>
          )}

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {view === 'bookmarks' ? (
              filteredBookmarks.length === 0 ? (
                <Empty text={bookmarks.length === 0 ? 'No bookmarks yet' : 'No matches'} isBookmarks />
              ) : (
                filteredBookmarks.map(bm => (
                  <BookmarkItem
                    key={bm.url}
                    bm={bm}
                    onNavigate={onNavigate}
                    onNewTab={onNewTab}
                    onUpdate={onBookmarkUpdate}
                    onRemove={onBookmarkRemove}
                  />
                ))
              )
            ) : (
              groupedHistory.length === 0 ? (
                <Empty text={history.length === 0 ? 'No history yet' : 'No matches'} />
              ) : (
                groupedHistory.map(([date, items]) => (
                  <div key={date}>
                    <div style={{
                      padding: '8px 14px 4px',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                    }}>
                      {date}
                    </div>
                    {items.map((item, i) => (
                      <HistoryItem key={i} item={item} onNavigate={onNavigate} onNewTab={onNewTab} />
                    ))}
                  </div>
                ))
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Empty({ text, isBookmarks }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 160,
      gap: 10,
    }}>
      <div style={{ opacity: 0.2 }}>
        {isBookmarks ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{text}</span>
    </div>
  )
}
