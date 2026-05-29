import React, { useState, useRef, useEffect, useCallback } from 'react'

export default function NavBar({
  tab, bookmarks, downloads, showPanel, findActive, addrFocusTick,
  onNavigate, onBack, onForward, onReload, onHome,
  onBookmarkSave, onBookmarkUpdate, onBookmarkRemove,
  onTogglePanel, onFind,
}) {
  const [inputVal, setInputVal] = useState('')
  const [focused, setFocused] = useState(false)
  const [bmPopover, setBmPopover] = useState(false)
  const [bmTitle, setBmTitle] = useState('')
  const [bmTags, setBmTags] = useState('')
  const inputRef = useRef(null)
  const popoverRef = useRef(null)

  useEffect(() => {
    if (!focused) setInputVal(tab?.displayUrl || '')
  }, [tab?.displayUrl, focused])

  // External signal to focus address bar (Ctrl+L)
  useEffect(() => {
    if (addrFocusTick > 0) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [addrFocusTick])

  // Close popover on outside click
  useEffect(() => {
    if (!bmPopover) return
    const handler = (e) => { if (!popoverRef.current?.contains(e.target)) setBmPopover(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [bmPopover])

  const handleFocus = () => {
    setFocused(true)
    setInputVal(tab?.displayUrl || '')
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const handleBlur = () => {
    setFocused(false)
    setInputVal(tab?.displayUrl || '')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { inputRef.current?.blur(); onNavigate(inputVal) }
    else if (e.key === 'Escape') { inputRef.current?.blur() }
  }

  const isBookmarked = bookmarks.some(b => b.url === tab?.displayUrl)
  const isSecure = tab?.displayUrl?.startsWith('https://')
  const activeDownloads = downloads.filter(d => !d.done)

  const openBmPopover = () => {
    const existing = bookmarks.find(b => b.url === tab?.displayUrl)
    setBmTitle(existing?.title || tab?.title || '')
    setBmTags((existing?.tags || []).join(', '))
    setBmPopover(v => !v)
  }

  const handleBmSave = () => {
    const bm = {
      url: tab?.displayUrl,
      title: bmTitle.trim() || tab?.title || tab?.displayUrl,
      favicon: tab?.favicon,
      tags: bmTags.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (isBookmarked) onBookmarkUpdate(bm)
    else onBookmarkSave(bm)
    setBmPopover(false)
  }

  const displayUrl = focused ? inputVal : (tab?.displayUrl || '')

  return (
    <div style={{
      height: 44,
      display: 'flex', alignItems: 'center', gap: 3, padding: '0 8px',
      background: 'rgba(15,15,19,0.98)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {/* Nav buttons */}
      <NavBtn onClick={onBack} disabled={!tab?.canGoBack} title="Back  Alt+←">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </NavBtn>
      <NavBtn onClick={onForward} disabled={!tab?.canGoForward} title="Forward  Alt+→">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </NavBtn>
      <NavBtn onClick={onReload} title={tab?.loading ? 'Stop  Esc' : 'Reload  Ctrl+R'}>
        {tab?.loading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        )}
      </NavBtn>
      <NavBtn onClick={onHome} title="Home">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </NavBtn>

      {/* Address bar */}
      <div style={{ flex: 1, position: 'relative' }} onClick={() => inputRef.current?.focus()}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: focused ? 'var(--surface2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${focused ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 9, padding: '0 10px', height: 32,
          cursor: 'text', transition: 'border-color 0.15s, background 0.15s',
        }}>
          {!focused && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={isSecure ? '#22c55e' : 'var(--muted)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              {isSecure
                ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                : <><circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>
              }
            </svg>
          )}
          <input
            ref={inputRef}
            value={displayUrl}
            onChange={e => setInputVal(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter URL  (Ctrl+L)"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13, userSelect: 'text',
            }}
          />
        </div>
      </div>

      {/* Bookmark star */}
      <div style={{ position: 'relative' }} ref={popoverRef}>
        <NavBtn onClick={openBmPopover} title={isBookmarked ? 'Edit bookmark' : 'Bookmark  Ctrl+D'} active={isBookmarked}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={isBookmarked ? '#f59e0b' : 'none'}
            stroke={isBookmarked ? '#f59e0b' : 'currentColor'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </NavBtn>

        {bmPopover && tab?.displayUrl && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
            width: 260, background: 'var(--surface2)',
            border: '1px solid var(--border)', borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', padding: 14,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              {isBookmarked ? 'Edit bookmark' : 'Add bookmark'}
            </div>
            <Label>Name</Label>
            <PInput value={bmTitle} onChange={setBmTitle} placeholder="Page title" />
            <Label style={{ marginTop: 8 }}>Tags <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(comma-separated)</span></Label>
            <PInput value={bmTags} onChange={setBmTags} placeholder="work, reference, design…" />
            {bmTags.trim() && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                {bmTags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {isBookmarked && (
                <button onClick={() => { onBookmarkRemove(tab.displayUrl); setBmPopover(false) }} style={{
                  flex: 1, padding: '6px 0', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>Remove</button>
              )}
              <button onClick={handleBmSave} style={{
                flex: 2, padding: '6px 0', borderRadius: 7, border: 'none',
                background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>Save</button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar toggles */}
      <NavBtn onClick={() => onTogglePanel('bookmarks')} title="Bookmarks  Ctrl+B" active={showPanel === 'bookmarks'}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </NavBtn>

      <NavBtn onClick={() => onTogglePanel('history')} title="History  Ctrl+H" active={showPanel === 'history'}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </NavBtn>

      <NavBtn onClick={onFind} title="Find in page  Ctrl+F" active={findActive}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </NavBtn>

      {/* Downloads */}
      {downloads.length > 0 && (
        <DownloadsBtn downloads={downloads} />
      )}
    </div>
  )
}

function Label({ children, style }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 4, ...style }}>{children}</div>
}

function PInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 7, padding: '6px 9px', color: 'var(--text)', fontSize: 12, outline: 'none',
        userSelect: 'text', boxSizing: 'border-box',
      }} />
  )
}

function NavBtn({ onClick, disabled, title, children, active }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, border: 'none', flexShrink: 0,
        background: active ? 'var(--accent-soft)' : hov && !disabled ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? 'var(--accent)' : disabled ? 'rgba(255,255,255,0.2)' : hov ? 'var(--text)' : 'var(--muted)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}>{children}</button>
  )
}

function DownloadsBtn({ downloads }) {
  const [show, setShow] = useState(false)
  const ref = useRef(null)
  const active = downloads.filter(d => !d.done)

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <NavBtn onClick={() => setShow(v => !v)} title="Downloads" active={show}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={active.length > 0 ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </NavBtn>
      {show && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200, width: 300,
          background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700 }}>Downloads</div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {[...downloads].reverse().map((d, i) => (
              <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</div>
                <div style={{ fontSize: 11, color: d.state === 'completed' ? '#22c55e' : d.done ? '#ef4444' : 'var(--accent)', marginTop: 2 }}>
                  {d.state === 'completed' ? 'Complete' : d.done ? 'Failed' : 'Downloading…'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
