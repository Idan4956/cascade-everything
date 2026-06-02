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

  useEffect(() => {
    if (addrFocusTick > 0) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [addrFocusTick])

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
  const isNewTab = !tab?.displayUrl || tab?.displayUrl === '' || tab?.isNewTab
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
      height: 50,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '0 8px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 9,
    }}>
      {/* Navigation buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <NavBtn onClick={onBack} disabled={!tab?.canGoBack} title="Back  Alt+←" size={32}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </NavBtn>
        <NavBtn onClick={onForward} disabled={!tab?.canGoForward} title="Forward  Alt+→" size={32}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </NavBtn>
        <NavBtn onClick={onReload} title={tab?.loading ? 'Stop' : 'Reload  Ctrl+R'} size={32}>
          {tab?.loading ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          )}
        </NavBtn>
        <NavBtn onClick={onHome} title="Home" size={32}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </NavBtn>
      </div>

      {/* Centered address bar wrapper */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          maxWidth: 680,
          position: 'relative',
        }}
          onClick={() => inputRef.current?.focus()}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 36,
            background: focused ? 'var(--surface3)' : 'var(--surface2)',
            border: focused
              ? '1px solid rgba(59,130,246,0.5)'
              : '1px solid var(--border-mid)',
            borderRadius: 18,
            padding: '0 12px',
            cursor: 'text',
            transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
            boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
          }}>
            {/* Security icon */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {!focused && !isNewTab && (
                isSecure ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
                  </svg>
                )
              )}
              {(focused || isNewTab) && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="var(--muted)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </div>

            <input
              ref={inputRef}
              value={displayUrl}
              onChange={e => setInputVal(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Search or type a URL"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--text)',
                fontSize: 13,
                userSelect: 'text',
                textAlign: focused ? 'left' : 'center',
                minWidth: 0,
              }}
            />

            {/* Clear button */}
            {focused && inputVal && (
              <button
                onMouseDown={e => { e.preventDefault(); setInputVal('') }}
                style={{
                  width: 18, height: 18,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right-side action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {/* Bookmark star */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <NavBtn
            onClick={openBmPopover}
            title={isBookmarked ? 'Edit bookmark' : 'Add bookmark'}
            active={isBookmarked || bmPopover}
            size={30}
          >
            <svg width="15" height="15" viewBox="0 0 24 24"
              fill={isBookmarked ? '#f59e0b' : 'none'}
              stroke={isBookmarked ? '#f59e0b' : 'currentColor'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </NavBtn>

          {bmPopover && tab?.displayUrl && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 300,
              width: 268,
              background: 'var(--surface2)',
              border: '1px solid var(--border-mid)',
              borderRadius: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
                {isBookmarked ? 'Edit Bookmark' : 'Add Bookmark'}
              </div>
              <FieldLabel>Name</FieldLabel>
              <PopInput value={bmTitle} onChange={setBmTitle} placeholder="Page title" autoFocus />
              <div style={{ height: 10 }} />
              <FieldLabel>Tags <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(comma-separated)</span></FieldLabel>
              <PopInput value={bmTags} onChange={setBmTags} placeholder="work, reference, design…" />
              {bmTags.trim() && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                  {bmTags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} style={{
                      fontSize: 11, padding: '2px 9px', borderRadius: 20,
                      background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
                {isBookmarked && (
                  <button
                    onClick={() => { onBookmarkRemove(tab.displayUrl); setBmPopover(false) }}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                  >Remove</button>
                )}
                <button
                  onClick={handleBmSave}
                  style={{
                    flex: 2, padding: '7px 0', borderRadius: 8, border: 'none',
                    background: 'var(--accent)', color: '#fff',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'filter 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = '' }}
                >Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Bookmarks panel toggle */}
        <NavBtn
          onClick={() => onTogglePanel('bookmarks')}
          title="Bookmarks  Ctrl+B"
          active={showPanel === 'bookmarks'}
          size={30}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </NavBtn>

        {/* History panel toggle */}
        <NavBtn
          onClick={() => onTogglePanel('history')}
          title="History  Ctrl+H"
          active={showPanel === 'history'}
          size={30}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </NavBtn>

        {/* Find in page */}
        <NavBtn
          onClick={onFind}
          title="Find in page  Ctrl+F"
          active={findActive}
          size={30}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </NavBtn>

        {/* Downloads */}
        {downloads.length > 0 && (
          <DownloadsBtn downloads={downloads} />
        )}
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 5 }}>
      {children}
    </div>
  )
}

function PopInput({ value, onChange, placeholder, autoFocus }) {
  return (
    <input
      autoFocus={autoFocus}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid var(--border-mid)',
        borderRadius: 8,
        padding: '7px 10px',
        color: 'var(--text)',
        fontSize: 12,
        outline: 'none',
        userSelect: 'text',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)' }}
      onBlur={e => { e.target.style.borderColor = 'var(--border-mid)' }}
    />
  )
}

function NavBtn({ onClick, disabled, title, children, active, size = 30 }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        flexShrink: 0,
        background: active
          ? 'var(--accent-soft)'
          : hov && !disabled
            ? 'rgba(255,255,255,0.1)'
            : 'transparent',
        color: active
          ? 'var(--accent)'
          : disabled
            ? 'rgba(255,255,255,0.2)'
            : hov
              ? 'var(--text)'
              : 'var(--muted)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      {children}
    </button>
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
      <NavBtn onClick={() => setShow(v => !v)} title="Downloads" active={show} size={30}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke={active.length > 0 ? 'var(--accent)' : 'currentColor'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </NavBtn>
      {show && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 300,
          width: 300,
          background: 'var(--surface2)',
          border: '1px solid var(--border-mid)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '11px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
          }}>
            Downloads
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {[...downloads].reverse().map((d, i) => (
              <div key={i} style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  fontSize: 12, color: 'var(--text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{d.filename}</div>
                <div style={{
                  fontSize: 11, marginTop: 2,
                  color: d.state === 'completed' ? '#22c55e' : d.done ? '#ef4444' : 'var(--accent)',
                }}>
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
