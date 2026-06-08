import React, { useState, useRef, useEffect, useCallback } from 'react'

export default function NavBar({
  tab, bookmarks, downloads, showPanel, findActive, addrFocusTick,
  adBlockEnabled, adBlockCount, sysStats, vpnConfig, onSetProxy,
  onNavigate, onBack, onForward, onReload, onHome,
  onBookmarkSave, onBookmarkUpdate, onBookmarkRemove,
  onTogglePanel, onFind, onToggleAdBlock, onPiP, onScreenshot,
  tabZoom, onZoomIn, onZoomOut, onZoomReset,
  readerMode, onToggleReaderMode,
}) {
  const [inputVal, setInputVal] = useState('')
  const [focused, setFocused] = useState(false)
  const [bmPopover, setBmPopover] = useState(false)
  const [bmTitle, setBmTitle] = useState('')
  const [bmTags, setBmTags] = useState('')
  const [loadPct, setLoadPct] = useState(null)
  const inputRef = useRef(null)
  const popoverRef = useRef(null)
  const loadTimerRef = useRef(null)
  const loadTabRef = useRef(null)

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

  useEffect(() => {
    clearTimeout(loadTimerRef.current)
    if (tab?.loading) {
      if (loadTabRef.current !== tab.id) {
        loadTabRef.current = tab.id
        setLoadPct(0)
        loadTimerRef.current = setTimeout(() => setLoadPct(72), 80)
      }
    } else if (loadPct !== null) {
      setLoadPct(100)
      loadTimerRef.current = setTimeout(() => { setLoadPct(null); loadTabRef.current = null }, 380)
    }
  }, [tab?.loading, tab?.id])

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
      height: 52,
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      padding: '0 10px',
      background: 'linear-gradient(180deg, var(--surface) 0%, rgba(30,30,35,0.98) 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 9,
    }}>

      {/* Navigation button group */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 1,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 10, padding: '3px 4px',
        flexShrink: 0,
      }}>
        <NavBtn onClick={onBack} disabled={!tab?.canGoBack} title="Back  Alt+←" size={30}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </NavBtn>
        <NavBtn onClick={onForward} disabled={!tab?.canGoForward} title="Forward  Alt+→" size={30}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </NavBtn>
        <NavBtn onClick={onReload} title={tab?.loading ? 'Stop' : 'Reload  Ctrl+R'} size={30}>
          {tab?.loading ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          )}
        </NavBtn>
        <NavBtn onClick={onHome} title="Home" size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        </NavBtn>
      </div>

      {/* GX Stats */}
      <div style={{ margin: '0 6px', flexShrink: 0 }}>
        {sysStats && <GXStats stats={sysStats} />}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0, margin: '0 4px' }} />

      {/* Address bar */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 8px' }}>
        <div style={{ flex: 1, maxWidth: 680, position: 'relative' }} onClick={() => inputRef.current?.focus()}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, height: 36,
            background: focused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
            border: focused ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20, padding: '0 12px', cursor: 'text',
            transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
            boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.1), inset 0 1px 2px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.15)',
          }}>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {!focused && !isNewTab && (
                isSecure ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
                )
              )}
              {(focused || isNewTab) && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
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
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text)', fontSize: 13, userSelect: 'text',
                textAlign: focused ? 'left' : 'center', minWidth: 0,
              }}
            />
            {focused && inputVal && (
              <button
                onMouseDown={e => { e.preventDefault(); setInputVal('') }}
                style={{
                  width: 17, height: 17, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.12)', color: 'var(--muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
              >
                <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0, margin: '0 4px' }} />

      {/* Right-side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>

        {/* Zoom controls (shown when zoomed) */}
        {Math.round((tabZoom || 1) * 100) !== 100 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '2px 2px', flexShrink: 0 }}>
            <NavBtn onClick={onZoomOut} title="Zoom out  Ctrl+-" size={26}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </NavBtn>
            <button
              onClick={onZoomReset}
              title="Reset zoom  Ctrl+0"
              style={{ fontSize: 11, color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 5px', fontFamily: 'inherit', fontWeight: 700, letterSpacing: '-0.02em', userSelect: 'none', minWidth: 36 }}
            >
              {Math.round((tabZoom || 1) * 100)}%
            </button>
            <NavBtn onClick={onZoomIn} title="Zoom in  Ctrl+=" size={26}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </NavBtn>
          </div>
        )}

        {/* Bookmark */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <NavBtn onClick={openBmPopover} title={isBookmarked ? 'Edit bookmark' : 'Add bookmark  Ctrl+D'} active={isBookmarked || bmPopover} size={30}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? '#f59e0b' : 'none'} stroke={isBookmarked ? '#f59e0b' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </NavBtn>
          {bmPopover && tab?.displayUrl && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 300,
              width: 268, background: 'var(--surface2)', border: '1px solid var(--border-mid)',
              borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', padding: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
                {isBookmarked ? 'Edit Bookmark' : 'Add Bookmark'}
              </div>
              <FieldLabel>Name</FieldLabel>
              <PopInput value={bmTitle} onChange={setBmTitle} placeholder="Page title" autoFocus />
              <div style={{ height: 10 }} />
              <FieldLabel>Tags <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(comma-separated)</span></FieldLabel>
              <PopInput value={bmTags} onChange={setBmTags} placeholder="work, reference…" />
              {bmTags.trim() && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                  {bmTags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
                {isBookmarked && (
                  <button onClick={() => { onBookmarkRemove(tab.displayUrl); setBmPopover(false) }}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                  >Remove</button>
                )}
                <button onClick={handleBmSave}
                  style={{ flex: 2, padding: '7px 0', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'filter 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = '' }}
                >Save</button>
              </div>
            </div>
          )}
        </div>

        {/* Panel toggles */}
        <NavBtn onClick={() => onTogglePanel('bookmarks')} title="Bookmarks  Ctrl+B" active={showPanel === 'bookmarks'} size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
        </NavBtn>
        <NavBtn onClick={() => onTogglePanel('history')} title="History  Ctrl+H" active={showPanel === 'history'} size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
        </NavBtn>
        <NavBtn onClick={() => onTogglePanel('social')} title="Messengers & Social" active={showPanel === 'social'} size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </NavBtn>
        <NavBtn onClick={onFind} title="Find  Ctrl+F" active={findActive} size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </NavBtn>
        <NavBtn onClick={() => onTogglePanel('sessions')} title="Sessions — save & restore tab groups" active={showPanel === 'sessions'} size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </NavBtn>

        {/* Divider before privacy tools */}
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', margin: '0 3px' }} />

        {/* Privacy group: VPN + Adblock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '2px 3px' }}>
          <VPNBtn config={vpnConfig} onSetProxy={onSetProxy} />
          <AdBlockBtn enabled={adBlockEnabled} count={adBlockCount} onToggle={onToggleAdBlock} />
        </div>

        {/* Divider before utility tools */}
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', margin: '0 3px' }} />

        {/* Utility: Reader Mode + PiP + Screenshot */}
        <NavBtn onClick={onToggleReaderMode} active={readerMode} title="Reader mode — clean article view" size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </NavBtn>
        <NavBtn onClick={onPiP} title="Picture-in-picture" size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><rect x="12" y="11" width="9" height="7" rx="1" fill="currentColor" stroke="none" opacity="0.5" /><rect x="12" y="11" width="9" height="7" rx="1" /></svg>
        </NavBtn>
        <NavBtn onClick={onScreenshot} title="Screenshot" size={30}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
        </NavBtn>

        {/* Downloads */}
        {downloads.length > 0 && <DownloadsBtn downloads={downloads} />}
      </div>

      {/* Loading progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: loadPct !== null ? `${loadPct}%` : '0%',
          background: 'linear-gradient(90deg, var(--accent) 0%, #60a5fa 60%, #a78bfa 100%)',
          boxShadow: '0 0 8px var(--accent)',
          transition: loadPct === 72 ? 'width 5s cubic-bezier(0.05, 0, 0.2, 1)' :
                      loadPct === 100 ? 'width 0.15s ease' :
                      'none',
          opacity: loadPct === null ? 0 : 1,
          borderRadius: '0 2px 2px 0',
        }} />
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

function GXStats({ stats }) {
  const [show, setShow] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const cpu = Math.round((stats.cpu || 0) * 100)
  const ram = Math.round((stats.ram || 0) * 100)
  const net = stats.netKBs || 0

  function fmtNet(n) {
    if (n >= 1024) return `${(n/1024).toFixed(1)}M`
    if (n > 0) return `${n}K`
    return '0K'
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setShow(v => !v)}
        title="GX Monitor"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px', borderRadius: 8, border: 'none',
          background: show ? 'rgba(255,255,255,0.08)' : 'transparent',
          cursor: 'pointer', height: 30,
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => { if (!show) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { if (!show) e.currentTarget.style.background = 'transparent' }}
      >
        <MiniBar value={cpu} color="var(--accent)" label="CPU" />
        <MiniBar value={ram} color="#8b5cf6" label="RAM" />
      </button>

      {show && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 300, width: 220,
          background: 'var(--surface2)',
          border: '1px solid var(--border-mid)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          padding: '14px 16px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            GX Monitor
          </div>
          <StatRow label="CPU Usage" value={`${cpu}%`} pct={cpu} color="var(--accent)" />
          <div style={{ height: 10 }} />
          <StatRow label="RAM Usage" value={`${Math.round(stats.memMB || 0)} MB`} pct={ram} color="#8b5cf6" />
          <div style={{ height: 10 }} />
          <StatRow label="Network" value={`${fmtNet(net)}/s`} pct={Math.min(net / 10, 100)} color="#10b981" />
          <div style={{ marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
            Updates every 2 seconds
          </div>
        </div>
      )}
    </div>
  )
}

function MiniBar({ value, color, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 32 }}>
      <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.min(value, 100)}%`, height: '100%',
          background: color,
          borderRadius: 2,
          transition: 'width 1s ease',
          boxShadow: `0 0 4px ${color}`,
        }} />
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{label} {value}%</div>
    </div>
  )
}

function StatRow({ label, value, pct, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: pct != null ? 4 : 0 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      </div>
      {pct != null && (
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(pct, 100)}%`, height: '100%',
            background: color,
            borderRadius: 2,
            transition: 'width 1s ease',
            boxShadow: `0 0 6px ${color}88`,
          }} />
        </div>
      )}
    </div>
  )
}

function VPNBtn({ config, onSetProxy }) {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ protocol: 'socks5', host: '', port: '1080' })
  const ref = useRef(null)

  useEffect(() => {
    if (config) setForm({ protocol: config.protocol || 'socks5', host: config.host || '', port: String(config.port || '1080') })
  }, [config])

  useEffect(() => {
    if (!show) return
    const h = e => { if (!ref.current?.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [show])

  const vpnOn = config?.enabled && config?.host

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <NavBtn onClick={() => setShow(v => !v)} active={!!vpnOn || show} title={vpnOn ? 'VPN: Connected' : 'VPN / Proxy'} size={30}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {vpnOn && <circle cx="12" cy="11" r="2.5" fill="currentColor" stroke="none" />}
        </svg>
      </NavBtn>

      {show && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 300,
          width: 256, background: 'var(--surface2)', border: '1px solid var(--border-mid)',
          borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>VPN / Proxy</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: vpnOn ? '#22c55e' : 'var(--muted)' }}>
              {vpnOn ? '● Connected' : '● Off'}
            </span>
          </div>

          <div style={{ fontSize: 10.5, color: 'var(--muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em' }}>PROTOCOL</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {['socks5', 'http', 'https'].map(p => (
              <button key={p} onClick={() => setForm(f => ({ ...f, protocol: p }))} style={{
                flex: 1, padding: '5px 0', borderRadius: 6,
                border: form.protocol === p ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: form.protocol === p ? 'var(--accent-soft)' : 'transparent',
                color: form.protocol === p ? 'var(--accent)' : 'var(--muted)',
                fontSize: 10.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
              }}>{p.toUpperCase()}</button>
            ))}
          </div>

          <VPNInput label="SERVER HOST" value={form.host} onChange={v => setForm(f => ({ ...f, host: v }))} placeholder="proxy.example.com" />
          <div style={{ height: 8 }} />
          <VPNInput label="PORT" value={form.port} onChange={v => setForm(f => ({ ...f, port: v }))} placeholder="1080" />

          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {vpnOn && (
              <button onClick={() => { onSetProxy?.({ ...form, enabled: false }); setShow(false) }} style={{
                flex: 1, padding: '7px 0', borderRadius: 7,
                border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>Disconnect</button>
            )}
            <button onClick={() => { onSetProxy?.({ ...form, enabled: true }); setShow(false) }} style={{
              flex: 2, padding: '7px 0', borderRadius: 7, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'filter 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = '' }}
            >Connect</button>
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.4 }}>
            Routes browser traffic through your proxy server
          </div>
        </div>
      )}
    </div>
  )
}

function VPNInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', height: 32, borderRadius: 7, border: '1px solid var(--border-mid)',
          background: 'rgba(255,255,255,0.05)', color: 'var(--text)', fontSize: 12,
          padding: '0 10px', outline: 'none', userSelect: 'text', boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--border-mid)' }}
      />
    </div>
  )
}

function AdBlockBtn({ enabled, count, onToggle }) {
  const [show, setShow] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const fmtCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <NavBtn
        onClick={() => setShow(v => !v)}
        title={enabled ? `Ad blocker on · ${count.toLocaleString()} blocked` : 'Ad blocker off'}
        active={show}
        size={30}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={enabled ? '#22c55e' : 'var(--muted)'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            {!enabled && <line x1="4" y1="4" x2="20" y2="20" stroke="#ef4444" strokeWidth="2" />}
          </svg>
          {enabled && count > 0 && (
            <div style={{
              position: 'absolute', top: -6, right: -8,
              background: '#22c55e',
              color: '#000',
              fontSize: 8,
              fontWeight: 700,
              borderRadius: 4,
              padding: '1px 3px',
              lineHeight: 1.4,
              minWidth: 14,
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              {fmtCount(count)}
            </div>
          )}
        </div>
      </NavBtn>

      {show && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 300,
          width: 240,
          background: 'var(--surface2)',
          border: '1px solid var(--border-mid)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={enabled ? '#22c55e' : 'var(--muted)'}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Ad Blocker</span>
              {/* Toggle switch */}
              <div
                onClick={() => onToggle?.(!enabled)}
                style={{
                  marginLeft: 'auto',
                  width: 34, height: 18,
                  borderRadius: 9,
                  background: enabled ? '#22c55e' : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 2, left: enabled ? 18 : 2,
                  width: 14, height: 14,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }} />
              </div>
            </div>
          </div>
          {/* Stats */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <StatRow
              label="Blocked this session"
              value={count.toLocaleString()}
              color={enabled ? '#22c55e' : 'var(--muted)'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

