import React, { useState, useEffect, useRef } from 'react'

const isMac = window.browserAPI?.platform === 'darwin'

const WS_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#f97316']

export default function TitleBar({
  tabs, allTabs, activeTabId, onSelectTab, onNewTab, onNewTabAfter, onCloseTab, onTabContextMenu,
  workspaces, activeWorkspaceId, onSwitchWorkspace, onAddWorkspace, onUpdateWorkspace, onDeleteWorkspace,
  onReorderTabs,
}) {
  const [maximized, setMaximized] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

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
        @keyframes tabspin { to { transform: rotate(360deg) } }
        .tab-close-btn {
          opacity: 0;
          transition: opacity 0.12s, background 0.1s, color 0.1s;
        }
        .tab-row:hover .tab-close-btn,
        .tab-row.tab-active .tab-close-btn { opacity: 1; }
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
        alignItems: 'center',
        flex: 1,
        overflow: 'hidden',
        WebkitAppRegion: 'no-drag',
        paddingLeft: isMac ? 82 : 8,
        paddingRight: isMac ? 8 : 0,
        height: '100%',
        gap: 0,
      }}>
        {/* Workspace pills */}
        <WorkspacePills
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          allTabs={allTabs || tabs}
          onSwitch={onSwitchWorkspace}
          onAdd={onAddWorkspace}
          onUpdate={onUpdateWorkspace}
          onDelete={onDeleteWorkspace}
        />

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'var(--border-mid)', flexShrink: 0, margin: '0 6px 0 4px', alignSelf: 'center' }} />

        {/* Tabs (aligned to bottom) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, overflow: 'hidden', height: '100%', gap: 0 }}>
          {tabs.map(tab => (
            <React.Fragment key={tab.id}>
              <Tab
                tab={tab}
                active={tab.id === activeTabId}
                dragOver={dragOverId === tab.id && dragId !== tab.id}
                onSelect={() => onSelectTab(tab.id)}
                onClose={(e) => { e.stopPropagation(); onCloseTab(tab.id) }}
                onContextMenu={(e) => { e.preventDefault(); onTabContextMenu?.(e, tab.id) }}
                onDragStart={() => setDragId(tab.id)}
                onDragOver={(e) => { e.preventDefault(); setDragOverId(tab.id) }}
                onDrop={() => { if (dragId && dragId !== tab.id) onReorderTabs?.(dragId, tab.id); setDragId(null); setDragOverId(null) }}
                onDragEnd={() => { setDragId(null); setDragOverId(null) }}
              />
              <InsertSlot onInsert={() => onNewTabAfter?.(tab.id)} />
            </React.Fragment>
          ))}
          <NewTabBtn onClick={onNewTab} />
        </div>
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

function WorkspacePills({ workspaces, activeWorkspaceId, allTabs, onSwitch, onAdd, onUpdate, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(WS_COLORS[1])
  const [renamingId, setRenamingId] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const [contextWs, setContextWs] = useState(null) // { id, x, y }
  const inputRef = useRef(null)
  const renameRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => { if (adding) inputRef.current?.focus() }, [adding])
  useEffect(() => { if (renamingId) renameRef.current?.focus() }, [renamingId])

  useEffect(() => {
    if (!contextWs) return
    const h = (e) => { if (!ctxRef.current?.contains(e.target)) setContextWs(null) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [contextWs])

  const tabCount = (wsId) => allTabs.filter(t => t.workspaceId === wsId).length

  const confirmAdd = () => {
    if (newName.trim()) onAdd(newName.trim(), newColor)
    setAdding(false)
    setNewName('')
    setNewColor(WS_COLORS[(workspaces.length) % WS_COLORS.length])
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
      {workspaces.map((ws) => {
        const active = ws.id === activeWorkspaceId
        const count = tabCount(ws.id)
        return (
          <div key={ws.id} style={{ position: 'relative' }}>
            {renamingId === ws.id ? (
              <input
                ref={renameRef}
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onUpdate(ws.id, { name: renameVal.trim() || ws.name }); setRenamingId(null) }
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                onBlur={() => { onUpdate(ws.id, { name: renameVal.trim() || ws.name }); setRenamingId(null) }}
                style={{
                  width: 64, height: 24, borderRadius: 6,
                  background: 'var(--surface2)', border: `1px solid ${ws.color}`,
                  color: 'var(--text)', fontSize: 11, padding: '0 6px',
                  outline: 'none', userSelect: 'text',
                }}
              />
            ) : (
              <button
                onClick={() => onSwitch(ws.id)}
                onDoubleClick={() => { setRenamingId(ws.id); setRenameVal(ws.name) }}
                onContextMenu={(e) => { e.preventDefault(); setContextWs({ id: ws.id, x: e.clientX, y: e.clientY }) }}
                title={`${ws.name} (${count} tab${count !== 1 ? 's' : ''})\nDouble-click to rename`}
                style={{
                  height: 26, minWidth: 26,
                  borderRadius: 7,
                  border: active ? `2px solid ${ws.color}` : `1px solid ${ws.color}44`,
                  background: active ? ws.color : `${ws.color}22`,
                  color: active ? '#fff' : ws.color,
                  fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', padding: '0 7px',
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                <span>{ws.name.slice(0, 8)}</span>
                {count > 0 && (
                  <span style={{
                    fontSize: 9, background: active ? 'rgba(0,0,0,0.25)' : `${ws.color}44`,
                    borderRadius: 4, padding: '0 3px', lineHeight: '14px',
                  }}>{count}</span>
                )}
              </button>
            )}
          </div>
        )
      })}

      {/* Add workspace */}
      {adding ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <input
            ref={inputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmAdd()
              if (e.key === 'Escape') { setAdding(false); setNewName('') }
            }}
            placeholder="Name…"
            style={{
              width: 72, height: 24, borderRadius: 6,
              background: 'var(--surface2)', border: '1px solid var(--border-mid)',
              color: 'var(--text)', fontSize: 11, padding: '0 6px',
              outline: 'none', userSelect: 'text',
            }}
          />
          <div style={{ display: 'flex', gap: 2 }}>
            {WS_COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)} style={{
                width: 12, height: 12, borderRadius: '50%', border: `2px solid ${newColor === c ? '#fff' : 'transparent'}`,
                background: c, cursor: 'pointer', padding: 0, flexShrink: 0,
              }} />
            ))}
          </div>
          <button onClick={confirmAdd} style={{
            height: 22, padding: '0 8px', borderRadius: 5, border: 'none',
            background: newColor, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>Add</button>
        </div>
      ) : (
        <button
          onClick={() => { setAdding(true); setNewColor(WS_COLORS[workspaces.length % WS_COLORS.length]) }}
          title="New workspace"
          style={{
            width: 22, height: 22, borderRadius: 6, border: 'none',
            background: 'rgba(255,255,255,0.07)', color: 'var(--muted)',
            cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s, color 0.1s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--muted)' }}
        >+</button>
      )}

      {/* Workspace context menu */}
      {contextWs && (
        <div ref={ctxRef} style={{
          position: 'fixed', top: contextWs.y, left: contextWs.x, zIndex: 9999,
          background: 'var(--surface2)', border: '1px solid var(--border-mid)',
          borderRadius: 8, padding: '4px', minWidth: 140,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          <CtxItem label="Rename" onClick={() => {
            const ws = workspaces.find(w => w.id === contextWs.id)
            setRenamingId(contextWs.id); setRenameVal(ws?.name || ''); setContextWs(null)
          }} />
          {workspaces.length > 1 && (
            <CtxItem label="Delete workspace" danger onClick={() => { onDelete(contextWs.id); setContextWs(null) }} />
          )}
        </div>
      )}
    </div>
  )
}

function CtxItem({ label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', padding: '6px 10px',
      background: 'none', border: 'none', textAlign: 'left',
      fontSize: 12, color: danger ? '#ef4444' : 'var(--text)',
      cursor: 'pointer', borderRadius: 5, fontFamily: 'inherit',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
    >{label}</button>
  )
}

function Tab({ tab, active, dragOver, onSelect, onClose, onContextMenu, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const [hov, setHov] = useState(false)

  if (tab.pinned) {
    return (
      <div
        className={`tab-row${active ? ' tab-active' : ''}`}
        draggable
        onClick={onSelect}
        onContextMenu={onContextMenu}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        title={tab.title}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: active ? 33 : 31,
          width: 36, minWidth: 36, flexShrink: 0,
          padding: '0 6px',
          borderRadius: '8px 8px 0 0',
          background: active ? 'var(--surface)' : hov ? 'rgba(255,255,255,0.06)' : 'transparent',
          cursor: 'grab',
          borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
          borderLeft: dragOver ? '2px solid var(--accent)' : active ? '1px solid var(--border-mid)' : '1px solid transparent',
          borderRight: active ? '1px solid var(--border-mid)' : '1px solid transparent',
          borderBottom: 'none',
          marginBottom: active ? -1 : 0,
          alignSelf: 'flex-end',
          transition: 'background 0.1s, border-color 0.1s',
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
      draggable
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
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
        cursor: 'grab',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
        borderLeft: dragOver ? '2px solid var(--accent)' : active ? '1px solid var(--border-mid)' : '1px solid transparent',
        borderRight: active ? '1px solid var(--border-mid)' : '1px solid transparent',
        borderBottom: 'none',
        marginBottom: active ? -1 : 0,
        alignSelf: 'flex-end',
        transition: 'background 0.1s, border-color 0.1s',
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
        color: active ? 'var(--text)' : tab.sleeping ? 'rgba(255,255,255,0.25)' : 'var(--muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
        fontWeight: active ? 500 : 400,
        letterSpacing: '-0.01em',
      }}>
        {tab.title || 'New Tab'}
      </span>

      {/* Sleep indicator */}
      {tab.sleeping && (
        <div title="Tab sleeping — click to wake" style={{
          flexShrink: 0, color: '#8b5cf6', opacity: 0.8,
          display: 'flex', alignItems: 'center',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
      )}

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

function InsertSlot({ onInsert }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={e => { e.stopPropagation(); onInsert() }}
      title="Open tab here"
      style={{
        width: hov ? 22 : 4,
        height: 28,
        alignSelf: 'flex-end',
        marginBottom: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: hov ? 'pointer' : 'default',
        transition: 'width 0.15s',
        flexShrink: 0,
        zIndex: hov ? 5 : 0,
      }}
    >
      <div style={{
        width: hov ? 18 : 1,
        height: hov ? 18 : 14,
        borderRadius: hov ? '50%' : 1,
        background: hov ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        color: 'rgba(255,255,255,0.75)',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1,
        flexShrink: 0,
      }}>
        {hov ? '+' : ''}
      </div>
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
