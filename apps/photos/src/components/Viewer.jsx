import React, { useState, useEffect, useRef, useCallback } from 'react'

export default function Viewer({ images, index, onNavigate, onClose }) {
  const img = images[index]
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [showConvert, setShowConvert] = useState(false)

  useEffect(() => { setZoom(1); setOffset({ x: 0, y: 0 }); setLoaded(false); setShowConvert(false) }, [index])

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
        {!loaded && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</div>}
        <img
          key={img.url}
          src={img.url}
          alt={img.name}
          onLoad={() => setLoaded(true)}
          style={{
            maxWidth: zoom === 1 ? '100%' : 'none',
            maxHeight: zoom === 1 ? '100%' : 'none',
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

      {hasPrev && <NavArrow side="left" onClick={() => { onNavigate(index - 1); setShowConvert(false) }} />}
      {hasNext && <NavArrow side="right" onClick={() => { onNavigate(index + 1); setShowConvert(false) }} />}

      {showConvert && <ConvertPanel image={img} onClose={() => setShowConvert(false)} />}

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
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />
        <ViewBtn onClick={() => setShowConvert(v => !v)} title="Convert format" active={showConvert}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
          </svg>
        </ViewBtn>
        <ViewBtn onClick={() => window.photosAPI.openInExplorer(img.fullPath)} title="Open folder in Cascade Explorer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
        </ViewBtn>
        <ViewBtn onClick={() => window.photosAPI.openExternal(img.fullPath)} title="Reveal in file manager">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5z"/></svg>
        </ViewBtn>
      </div>
    </div>
  )
}

function ConvertPanel({ image, onClose }) {
  const [format, setFormat] = useState('jpeg')
  const [quality, setQuality] = useState(92)
  const [status, setStatus] = useState(null) // null | 'converting' | 'done' | 'error'

  const convert = async () => {
    setStatus('converting')
    try {
      const imgEl = new Image()
      imgEl.crossOrigin = 'anonymous'
      imgEl.src = image.url
      await new Promise((res, rej) => { imgEl.onload = res; imgEl.onerror = rej })

      const canvas = document.createElement('canvas')
      canvas.width = imgEl.naturalWidth
      canvas.height = imgEl.naturalHeight
      const ctx = canvas.getContext('2d')
      if (format === 'jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      ctx.drawImage(imgEl, 0, 0)

      const mimeType = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[format]
      const blob = await new Promise(res => canvas.toBlob(res, mimeType, quality / 100))
      const buffer = await blob.arrayBuffer()

      const ext = format === 'jpeg' ? 'jpg' : format
      const baseName = image.name.replace(/\.[^.]+$/, '') + '.' + ext
      const savePath = await window.photosAPI.saveDialog({ defaultName: baseName, ext })
      if (!savePath) { setStatus(null); return }

      const result = await window.photosAPI.saveConverted({ buffer, outputPath: savePath })
      setStatus(result.ok ? 'done' : 'error')
      if (result.ok) setTimeout(onClose, 1200)
    } catch { setStatus('error') }
  }

  return (
    <div style={{
      position: 'absolute', bottom: 56, right: 16,
      background: 'rgba(18,18,26,0.96)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14,
      padding: '16px 18px', width: 230, zIndex: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.6, marginBottom: 12, textTransform: 'uppercase' }}>Convert Image</div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['jpeg','JPEG'],['png','PNG'],['webp','WebP']].map(([id, label]) => (
          <button key={id} onClick={() => setFormat(id)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: `1px solid ${format === id ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.1)'}`,
            background: format === id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
            color: format === id ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {format !== 'png' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
            <span>Quality</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{quality}%</span>
          </div>
          <input type="range" min={10} max={100} value={quality}
            onChange={e => setQuality(+e.target.value)}
            style={{ width: '100%', accentColor: '#8b5cf6' }} />
        </div>
      )}

      <button onClick={convert} disabled={status === 'converting'} style={{
        width: '100%', padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
        background: status === 'done' ? '#16a34a' : 'rgba(139,92,246,0.85)',
        color: '#fff', border: 'none',
        cursor: status === 'converting' ? 'default' : 'pointer',
        opacity: status === 'converting' ? 0.7 : 1,
        transition: 'background 0.2s',
      }}>
        {status === 'converting' ? 'Converting…' : status === 'done' ? 'Saved!' : status === 'error' ? 'Error — try again' : 'Convert & Save'}
      </button>
    </div>
  )
}

function NavArrow({ side, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [side]: 16, width: 40, height: 40, borderRadius: '50%',
        background: hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s', zIndex: 10,
      }}>
      {side === 'left'
        ? <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/></svg>
        : <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg>
      }
    </button>
  )
}

function ViewBtn({ onClick, title, children, disabled, active }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: active ? 'rgba(139,92,246,0.2)' : hov && !disabled ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: 'none',
        color: disabled ? 'rgba(255,255,255,0.2)' : active ? '#c4b5fd' : hov ? '#fff' : 'rgba(255,255,255,0.6)',
        cursor: disabled ? 'default' : 'pointer',
        padding: '5px 7px', borderRadius: 6,
        display: 'flex', alignItems: 'center',
        transition: 'color 0.15s, background 0.15s',
      }}
    >{children}</button>
  )
}
