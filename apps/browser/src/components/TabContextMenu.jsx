import React, { useEffect, useRef } from 'react'

export default function TabContextMenu({
  x, y, tab, tabs, recentlyClosed, onClose,
  onNewTab, onDuplicate, onPin, onReloadTab,
  onCloseTab, onCloseOthers, onCloseToRight, onReopenClosed,
}) {
  const menuRef = useRef(null)

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    const rect = menu.getBoundingClientRect()
    if (rect.right > window.innerWidth) menu.style.left = `${window.innerWidth - rect.width - 8}px`
    if (rect.bottom > window.innerHeight) menu.style.top = `${window.innerHeight - rect.height - 8}px`
  }, [])

  useEffect(() => {
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const tabIdx = tabs.findIndex(t => t.id === tab?.id)
  const hasToRight = tabIdx >= 0 && tabIdx < tabs.length - 1
  const hasOthers = tabs.length > 1

  const groups = [
    [
      { label: 'New tab', action: () => { onNewTab(); onClose() } },
      { label: 'Duplicate tab', action: () => { onDuplicate(tab?.id); onClose() } },
    ],
    [
      { label: tab?.pinned ? 'Unpin tab' : 'Pin tab', action: () => { onPin(tab?.id); onClose() } },
      { label: 'Reload tab', action: () => { onReloadTab(tab?.id); onClose() } },
    ],
    [
      { label: 'Close tab', action: () => { onCloseTab(tab?.id); onClose() } },
      { label: 'Close other tabs', action: () => { onCloseOthers(tab?.id); onClose() }, disabled: !hasOthers },
      { label: 'Close tabs to the right', action: () => { onCloseToRight(tab?.id); onClose() }, disabled: !hasToRight },
    ],
    [
      { label: 'Reopen closed tab', action: () => { onReopenClosed(); onClose() }, disabled: !recentlyClosed.length },
    ],
  ]

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
        minWidth: 216,
        background: 'var(--surface2)',
        border: '1px solid var(--border-mid)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.35)',
        padding: '4px',
        userSelect: 'none',
      }}
    >
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '3px 2px' }} />}
          {group.map((item, ii) => (
            <MenuItem key={ii} item={item} />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

function MenuItem({ item }) {
  return (
    <button
      onClick={item.action}
      disabled={item.disabled}
      style={{
        display: 'block',
        width: '100%',
        padding: '7px 12px',
        background: 'none',
        border: 'none',
        textAlign: 'left',
        fontSize: 12.5,
        color: item.disabled ? 'rgba(255,255,255,0.25)' : 'var(--text)',
        cursor: item.disabled ? 'default' : 'pointer',
        borderRadius: 6,
        fontFamily: 'inherit',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
    >
      {item.label}
    </button>
  )
}
