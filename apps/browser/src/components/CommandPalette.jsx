import React, { useState, useEffect, useRef, useMemo } from 'react'

export default function CommandPalette({ tabs, history, bookmarks, onSelectTab, onNavigate, onNewTab, onOpenSettings, onTogglePanel, onClose }) {
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const results = useMemo(() => {
    const query = q.toLowerCase().trim()
    const items = []

    tabs.forEach(t => {
      const title = (t.title || 'New Tab').toLowerCase()
      const url = (t.displayUrl || '').toLowerCase()
      if (!query || title.includes(query) || url.includes(query)) {
        items.push({ kind: 'tab', id: t.id, title: t.title || 'New Tab', sub: t.displayUrl || '', favicon: t.favicon, loading: t.loading })
      }
    })

    if (query.length >= 1) {
      bookmarks.filter(b => b.title?.toLowerCase().includes(query) || b.url?.toLowerCase().includes(query))
        .slice(0, 4).forEach(b => items.push({ kind: 'bookmark', url: b.url, title: b.title || b.url, sub: b.url, favicon: b.favicon }))
      history.filter(h => h.title?.toLowerCase().includes(query) || h.url?.toLowerCase().includes(query))
        .slice(0, 4).forEach(h => items.push({ kind: 'history', url: h.url, title: h.title || h.url, sub: h.url }))
    }

    const cmds = [
      { kind: 'cmd', title: 'New Tab', sub: 'Open a new empty tab', icon: '+', action: () => { onNewTab(); onClose() } },
      { kind: 'cmd', title: 'Settings', sub: 'Open browser settings', icon: '⚙', action: () => { onOpenSettings(); onClose() } },
      { kind: 'cmd', title: 'Bookmarks', sub: 'Open bookmarks panel', icon: '★', action: () => { onTogglePanel('bookmarks'); onClose() } },
      { kind: 'cmd', title: 'History', sub: 'Open history panel', icon: '⏱', action: () => { onTogglePanel('history'); onClose() } },
    ]
    cmds.filter(c => !query || c.title.toLowerCase().includes(query) || c.sub.toLowerCase().includes(query))
      .forEach(c => items.push(c))

    return items
  }, [q, tabs, history, bookmarks])

  useEffect(() => { setIdx(0) }, [q])

  const activate = (item) => {
    if (!item) return
    if (item.kind === 'tab') { onSelectTab(item.id); onClose() }
    else if (item.kind === 'bookmark' || item.kind === 'history') { onNavigate(item.url); onClose() }
    else if (item.kind === 'cmd') { item.action() }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter') { e.preventDefault(); activate(results[idx]) }
  }

  useEffect(() => {
    const el = listRef.current?.children[idx]
    el?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  const kindIcon = (kind) => {
    if (kind === 'tab') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="16" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="19" x2="12" y2="21"/></svg>
    if (kind === 'bookmark') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    if (kind === 'history') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    return null
  }

  const kindColor = { tab: 'var(--accent)', bookmark: '#f59e0b', history: 'var(--muted)', cmd: '#10b981' }

  const sectionLabel = (item, i) => {
    if (i === 0) return item.kind
    if (results[i - 1].kind !== item.kind) return item.kind
    return null
  }
  const sectionNames = { tab: 'Open Tabs', bookmark: 'Bookmarks', history: 'History', cmd: 'Commands' }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 80,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 620,
        background: 'var(--surface2)',
        border: '1px solid var(--border-mid)',
        borderRadius: 14,
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 160px)',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tabs, bookmarks, history, or run a command…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 15, userSelect: 'text',
            }}
          />
          <kbd style={{
            fontSize: 10, color: 'var(--muted)', background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-mid)', borderRadius: 4, padding: '2px 6px',
            flexShrink: 0,
          }}>Esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ overflowY: 'auto', padding: '6px 0' }}>
          {results.length === 0 && (
            <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No results for "{q}"
            </div>
          )}
          {results.map((item, i) => {
            const sec = sectionLabel(item, i)
            return (
              <React.Fragment key={`${item.kind}-${item.id || item.url || item.title}-${i}`}>
                {sec && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 18px 4px', marginTop: i > 0 ? 4 : 0 }}>
                    {sectionNames[sec]}
                  </div>
                )}
                <div
                  onClick={() => activate(item)}
                  onMouseEnter={() => setIdx(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 18px',
                    background: idx === i ? 'rgba(255,255,255,0.07)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.08s',
                    borderLeft: idx === i ? `2px solid var(--accent)` : '2px solid transparent',
                  }}
                >
                  {/* Icon */}
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.kind === 'cmd' ? (
                      <span style={{ fontSize: 14, color: kindColor.cmd }}>{item.icon}</span>
                    ) : item.favicon ? (
                      <img src={item.favicon} width={14} height={14} style={{ borderRadius: 2 }} onError={e => e.target.style.display='none'} />
                    ) : (
                      <span style={{ color: kindColor[item.kind] }}>{kindIcon(item.kind)}</span>
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                    {item.sub && <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{item.sub}</div>}
                  </div>

                  {/* Badge */}
                  <div style={{ fontSize: 10, color: kindColor[item.kind], fontWeight: 600, flexShrink: 0, opacity: 0.7 }}>
                    {item.kind === 'tab' ? 'TAB' : item.kind === 'bookmark' ? 'BM' : item.kind === 'history' ? 'HIST' : ''}
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
          {[['↑↓', 'navigate'], ['↵', 'select'], ['Esc', 'close']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <kbd style={{ fontSize: 10, color: 'var(--muted)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-mid)', borderRadius: 4, padding: '1px 5px' }}>{key}</kbd>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
