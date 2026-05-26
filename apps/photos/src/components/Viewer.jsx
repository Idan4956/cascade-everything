import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function Viewer({ images, index, onNavigate, onClose }) {
  const img = images[index]
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // Reset zoom/pan when image changes
  useEffect(() => { setZoom(1); setOffset({ x: 0, y: 0 }); setLoaded(false) }, [index])

  const zoomIn = useCallback(() => setZoom(z => Math.min(z * 1.3, 8)), [])
  const zoomOut = useCallback(() => { setZoom(z => { const next = z / 1.3; if (next <= 1) { setOffset({ x: 0, y: 0 }); return 1 } return next }) }, [])
  const resetZoom = useCallback(() => { setZoom(1); setOffset({ x: 0, y: 0 }) }, [])

  const onWheel = useCallback((e) => {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn(); else zoomOut()
  }, [zoomIn, zoomOut])

  const onMouseDown = useCallback((e) => {
    if (zoom <= 1 || e.button !== 0) return
    setDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }, [zoom, offset])

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }, [dragging])

  const onMouseUp = useCallback(() => setDragging(false), [])

  const hasPrev = index > 0
  const hasNext = index < images.length - 1

  return (
    <div
      style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0a0a0e' }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Image */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
      }}>
        {!loaded && (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        )}
        <img
          key={img.url}
          src={img.url}
          alt={img.name}
          onLoad={() => setLoaded(true)}
          style={{
            maxWidth: zoom === 1 ? '100%' : 'none',
            maxHeight: zoom === 1 ? '100%' : 'none',
            width: zoom === 1 ? 'auto' : 'auto',
            height: zoom === 1 ? 'auto' : 'auto',
            transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
            transformOrigin: 'center',
            transition: dragging ? 'none' : 'transform 0.12s ease',
            display: loaded ? 'block' : 'none',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Prev / Next arrows */}
      {hasPrev && (
        <NavArrow side="left" onClick={() => onNavigate(index - 1)} />
      )}
      {hasNext && (
        <NavArrow side="right" onClick={() => onNavigate(index + 1)} />
      )}

      {/* Bottom toolbar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 20px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {img.name}
          <span style={{ marginLeft: 10, opacity: 0.5 }}>{index + 1} / {images.length}</span>
        </span>
        <ViewBtn onClick={zoomOut} title="Zoom out" disabled={zoom <= 1}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 10.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm4.546.75-2.908-2.908A5.5 5.5 0 1 0 6 12a5.47 5.47 0 0 0 3.342-1.12l2.908 2.908.708-.707-2.908-2.909a5.479 5.479 0 0 0 .496-.922zM3.5 6h5v1h-5z"/></svg>
        </ViewBtn>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 36, textAlign: 'center', cursor: zoom !== 1 ? 'pointer' : 'default' }} onClick={resetZoom}>
          {Math.round(zoom * 100)}%
        </span>
        <ViewBtn onClick={zoomIn} title="Zoom in" disabled={zoom >= 8}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 10.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm4.546.75-2.908-2.908A5.5 5.5 0 1 0 6 12a5.47 5.47 0 0 0 3.342-1.12l2.908 2.908.708-.707-2.908-2.909a5.479 5.479 0 0 0 .496-.922zM6.5 3v3H3.5V7h3v3h1V7h3V6h-3V3z"/></svg>
        </ViewBtn>
        <ViewBtn onClick={() => window.photosAPI.openExternal(img.fullPath)} title="Show in Explorer">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z"/></svg>
        </ViewBtn>
      </div>
    </div>
  )
}

function NavArrow({ side, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [side]: 16,
        width: 40, height: 40, borderRadius: '50%',
        background: hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
        zIndex: 10,
      }}
    >
      {side === 'left'
        ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/></svg>
        : <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
      }
    </button>
  )
}

function ViewBtn({ onClick, title, children, disabled }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      background: 'transparent', border: 'none',
      color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
      cursor: disabled ? 'default' : 'pointer',
      padding: '5px 7px', borderRadius: 6,
      display: 'flex', alignItems: 'center',
      transition: 'color 0.15s',
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.color = disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}
    >{children}</button>
  )
}
