import React from 'react'
import { FileTile, kindLabel, IconEye, IconShare, IconStar, IconCopy, IconMore, IconPlus } from './icons'
import { AIActions } from './features'
import { useTheme } from '../contexts/ThemeContext'

const HUE_PRESETS = [15, 45, 80, 145, 185, 235, 290, 330]

function toFileUrl(filePath) {
  if (!filePath) return ''
  const normalized = filePath.replace(/\\/g, '/')
  return normalized.startsWith('/') ? `file://${encodeURI(normalized)}` : `file:///${encodeURI(normalized)}`
}

export default function CascadeDeepPreview({ item, accent, tagMap, onToggleTag, tagDefs = [], onAddTag, siblings = [], onNavigate }) {
  const { T } = useTheme()
  const rgb = accent?.rgb || '111,76,179'

  if (!item) return (
    <div style={{
      flex: 1, minWidth: 300,
      background: T.glassPreviewBg,
      backdropFilter: T.glassBlur,
      WebkitBackdropFilter: T.glassBlur,
      borderLeft: `1px solid ${T.glassBorderOuter}`,
      boxShadow: T.dark
        ? 'inset 1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.10)'
        : 'inset 1px 0 0 rgba(255,255,255,0.80), inset 0 1px 0 rgba(255,255,255,0.90)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: T.textDim, fontSize: 13, flexDirection: 'column', gap: 14,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: T.dark ? `rgba(${rgb},0.14)` : `rgba(${rgb},0.08)`,
        border: `1.5px solid rgba(${rgb},${T.dark ? '0.25' : '0.18'})`,
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 20px rgba(${rgb},0.15)`,
      }}>
        <FileTile kind="folder" size={34} />
      </div>
      <span style={{ fontSize: 12.5, color: T.textDim }}>Select a file to preview</span>
    </div>
  )

  return (
    <div style={{
      flex: 1, minWidth: 300,
      background: T.glassPreviewBg,
      backdropFilter: T.glassBlur,
      WebkitBackdropFilter: T.glassBlur,
      borderLeft: `1px solid ${T.glassBorderOuter}`,
      boxShadow: T.dark
        ? 'inset 1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.10)'
        : 'inset 1px 0 0 rgba(255,255,255,0.80), inset 0 1px 0 rgba(255,255,255,0.90)',
      display: 'flex', flexDirection: 'column', overflow: 'auto',
      scrollSnapAlign: 'start',
    }}>
      <PreviewHero item={item} accent={accent} siblings={siblings} onNavigate={onNavigate} />

      {/* Name + kind badge */}
      <div style={{ padding: '16px 18px 10px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, wordBreak: 'break-word', lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 5,
            background: T.dark ? `rgba(${rgb},0.18)` : `rgba(${rgb},0.10)`,
            color: T.dark ? `rgba(${rgb.split(',').map(v => Math.min(255, +v + 100)).join(',')},1)` : accent?.c,
            border: `1px solid rgba(${rgb},${T.dark ? '0.28' : '0.20'})`,
          }}>{kindLabel(item.kind)}</span>
          {item.size && <span style={{ fontSize: 12, color: T.textDim }}>{item.size}</span>}
        </div>
      </div>

      {/* Glass action buttons */}
      <div style={{ padding: '2px 14px 14px', display: 'flex', gap: 6 }}>
        <PvAction icon={<IconEye size={13} />} label="Open" primary accent={accent}
          onClick={() => window.electronAPI?.openExternal(item.path)} />
        <PvAction icon={<IconShare size={13} />} accent={accent}
          onClick={() => window.electronAPI?.showInFolder(item.path)} />
        <PvAction icon={<IconCopy size={13} />} accent={accent}
          onClick={() => navigator.clipboard?.writeText(item.path)} />
        {item.kind === 'image' && (
          <PvAction
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>}
            label="Photos"
            accent={accent}
            onClick={() => window.electronAPI?.openInPhotos(item.path)}
          />
        )}
        <PvAction icon={<IconMore size={13} />} accent={accent} />
      </div>

      {/* Metadata glass card */}
      <div style={{
        margin: '0 14px 14px',
        padding: '0 14px',
        background: T.dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 12,
        border: `1px solid ${T.glassBorder}`,
        boxShadow: T.dark
          ? 'inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 14px rgba(0,0,0,0.20)'
          : 'inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {[
          ['Kind', kindLabel(item.kind)],
          ['Size', item.size],
          ['Modified', item.modified],
          ['Dimensions', item.dim],
          ['Duration', item.duration],
          ['Path', item.path],
        ].filter(r => r[1]).map(([k, v], i, arr) => (
          <div key={k} style={{
            display: 'flex', fontSize: 11.5, padding: '8px 0', alignItems: 'flex-start',
            borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <div style={{ width: 78, color: T.textDim, flexShrink: 0, fontWeight: 600, fontSize: 10.5, paddingTop: 1, letterSpacing: 0.2 }}>{k}</div>
            <div style={{
              flex: 1, color: T.textMid, lineHeight: 1.5,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: k === 'Path' ? 'nowrap' : 'normal',
            }}>{String(v)}</div>
          </div>
        ))}
      </div>

      {/* Tag editor */}
      <TagEditor item={item} tagDefs={tagDefs} tagMap={tagMap} onToggleTag={onToggleTag} onAddTag={onAddTag} accent={accent} />

      <AIActions item={item} accent={accent} />
    </div>
  )
}

function TagEditor({ item, tagDefs, tagMap, onToggleTag, onAddTag, accent }) {
  const { T } = useTheme()
  const [addingTag, setAddingTag] = React.useState(false)
  const [newTagName, setNewTagName] = React.useState('')
  const [newTagHue, setNewTagHue] = React.useState(235)
  const activeTags = tagMap?.[item?.path] || item?.tags || []
  const rgb = accent?.rgb || '111,76,179'

  const handleAdd = () => {
    const name = newTagName.trim()
    if (!name) return
    onAddTag?.(name, newTagHue)
    setNewTagName('')
    setNewTagHue(235)
    setAddingTag(false)
  }

  return (
    <div style={{ padding: '0 14px 14px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: 0.7, padding: '4px 0 8px', textTransform: 'uppercase' }}>Tags</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tagDefs.map(t => {
          const active = activeTags.includes(t.id)
          return (
            <button key={t.id} onClick={() => onToggleTag?.(item.path, t.id)} style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 99,
              background: active
                ? `oklch(${T.dark ? '0.35 0.12' : '0.94 0.05'} ${t.hue})`
                : (T.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)'),
              backdropFilter: 'blur(8px)',
              color: active ? `oklch(${T.dark ? '0.80 0.16' : '0.35 0.14'} ${t.hue})` : T.textSub,
              border: `1px solid ${active ? `oklch(${T.dark ? '0.45 0.14' : '0.86 0.06'} ${t.hue})` : T.glassBorder}`,
              cursor: 'pointer', fontWeight: active ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: active ? `0 2px 8px oklch(0.55 0.16 ${t.hue} / 0.3)` : 'none',
              transition: 'all 0.14s',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 99, background: `oklch(0.62 0.16 ${t.hue})` }} />
              {t.name}
            </button>
          )
        })}
        <button
          onClick={() => { setAddingTag(v => !v); setNewTagName(''); setNewTagHue(235) }}
          style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 99,
            background: addingTag ? `rgba(${rgb},0.16)` : (T.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)'),
            backdropFilter: 'blur(8px)',
            color: addingTag ? accent?.c : T.textSub,
            border: `1px solid ${addingTag ? `rgba(${rgb},0.40)` : T.glassBorder}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            transition: 'all 0.14s',
          }}>
          <IconPlus size={9} /> New tag
        </button>
      </div>

      {addingTag && (
        <div style={{
          marginTop: 10, padding: '12px 14px',
          background: T.dark ? 'rgba(0,0,0,0.40)' : 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 12,
          border: `1px solid ${T.glassBorder}`,
          boxShadow: T.dark
            ? 'inset 0 1px 0 rgba(255,255,255,0.10), 0 4px 16px rgba(0,0,0,0.24)'
            : 'inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 10px rgba(0,0,0,0.08)',
        }}>
          <input
            autoFocus value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingTag(false) }}
            placeholder="Tag name…"
            style={{
              width: '100%', height: 30, padding: '0 10px',
              border: `1px solid ${T.glassBorder}`, borderRadius: 7,
              fontSize: 12, outline: 'none',
              background: T.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.80)',
              color: T.text, boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 5, marginTop: 9, flexWrap: 'wrap' }}>
            {HUE_PRESETS.map(hue => (
              <button key={hue} onClick={() => setNewTagHue(hue)} style={{
                width: 18, height: 18, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: `oklch(0.62 0.16 ${hue})`,
                outline: newTagHue === hue ? `2.5px solid oklch(0.35 0.14 ${hue})` : 'none',
                outlineOffset: 2,
                boxShadow: newTagHue === hue ? `0 2px 8px oklch(0.55 0.18 ${hue} / 0.5)` : 'none',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
            <button onClick={handleAdd} style={{
              flex: 1, height: 28, border: 'none', borderRadius: 7,
              background: accent?.c || '#6f4cb3', color: '#fff',
              fontSize: 11.5, cursor: 'pointer', fontWeight: 600,
              boxShadow: `0 3px 12px rgba(${rgb},0.40)`,
            }}>Add tag</button>
            <button onClick={() => setAddingTag(false)} style={{
              flex: 1, height: 28, border: `1px solid ${T.glassBorder}`, borderRadius: 7,
              background: T.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.65)',
              color: T.textSub, fontSize: 11.5, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewHero({ item, accent, siblings = [], onNavigate }) {
  const { T } = useTheme()
  const [textPreview, setTextPreview] = React.useState(null)
  const rgb = accent?.rgb || '111,76,179'

  React.useEffect(() => {
    if (item.kind === 'text' || item.kind === 'pdf' || item.kind === 'doc') {
      window.electronAPI?.readText(item.path).then(r => {
        if (r?.content) setTextPreview(r.content)
      })
    } else {
      setTextPreview(null)
    }
  }, [item.path, item.kind])

  const imgIdx = item.kind === 'image' ? siblings.findIndex(s => s.path === item.path) : -1
  const prevImg = imgIdx > 0 ? siblings[imgIdx - 1] : null
  const nextImg = imgIdx >= 0 && imgIdx < siblings.length - 1 ? siblings[imgIdx + 1] : null

  React.useEffect(() => {
    if (item.kind !== 'image') return
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowLeft' && prevImg) onNavigate?.(prevImg.path)
      if (e.key === 'ArrowRight' && nextImg) onNavigate?.(nextImg.path)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item.kind, prevImg, nextImg, onNavigate])

  if (item.kind === 'image') {
    const navBtnStyle = {
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      width: 32, height: 32, borderRadius: 99,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.18)',
      color: '#fff', fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2, transition: 'background 0.12s',
    }
    return (
      <div style={{ height: 220, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        <img
          src={toFileUrl(item.path)} alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
        }} />
        {prevImg && (
          <button onClick={() => onNavigate?.(prevImg.path)} style={{ ...navBtnStyle, left: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.78)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        )}
        {nextImg && (
          <button onClick={() => onNavigate?.(nextImg.path)} style={{ ...navBtnStyle, right: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.78)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        )}
        {siblings.length > 1 && imgIdx >= 0 && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 99, padding: '2px 8px', fontSize: 10.5, color: '#fff', fontWeight: 600,
          }}>
            {imgIdx + 1} / {siblings.length}
          </div>
        )}
      </div>
    )
  }

  if (item.kind === 'video') {
    return (
      <div style={{ height: 200, background: '#060410', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <video
          src={toFileUrl(item.path)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => e.currentTarget.style.display = 'none'}
        />
        <div style={{
          width: 58, height: 58, borderRadius: 99, zIndex: 2,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.40)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M7 4l13 8-13 8z" /></svg>
        </div>
      </div>
    )
  }

  if (item.kind === 'audio') {
    return (
      <div style={{
        height: 180, flexShrink: 0,
        background: `linear-gradient(145deg, #07050f 0%, rgba(${rgb},0.30) 100%)`,
        display: 'flex', alignItems: 'flex-end', padding: '14px 12px',
        gap: 1.5, position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '20%', left: '30%',
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${rgb},0.45) 0%, transparent 70%)`,
          filter: 'blur(24px)', pointerEvents: 'none',
        }} />
        {Array.from({ length: 50 }).map((_, i) => {
          const h = 10 + Math.abs(Math.sin(i * 0.53 + i * 0.15) * 60) + Math.abs(Math.cos(i * 0.32) * 26)
          return <div key={i} style={{
            flex: 1, height: Math.min(h, 104), borderRadius: 2,
            background: i < 22
              ? `rgba(${rgb},0.88)`
              : `rgba(${rgb},0.28)`,
          }} />
        })}
        <div style={{ position: 'absolute', top: 12, left: 14, fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
          {item.name}
        </div>
      </div>
    )
  }

  if (item.kind === 'text' && textPreview) {
    return (
      <div style={{
        height: 220, flexShrink: 0, padding: '14px 16px',
        fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
        fontSize: 10.5, color: T.text,
        whiteSpace: 'pre-wrap', overflow: 'hidden',
        position: 'relative', lineHeight: 1.65, background: T.codeBg,
      }}>
        {textPreview}
        <div style={{
          position: 'absolute', inset: 'auto 0 0 0', height: 72,
          background: `linear-gradient(transparent, ${T.codeBg})`,
        }} />
      </div>
    )
  }

  if (item.kind === 'pdf' || item.kind === 'doc' || item.kind === 'sheet') {
    const docBg = T.dark
      ? `linear-gradient(145deg, rgba(${rgb},0.18) 0%, rgba(${rgb},0.06) 100%)`
      : 'linear-gradient(150deg, #f6f1eb 0%, #ede7de 100%)'
    return (
      <div style={{ height: 220, flexShrink: 0, background: docBg, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <div style={{
          width: 118, aspectRatio: '8.5/11',
          background: T.dark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${T.dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)'}`,
          boxShadow: `0 12px 36px rgba(0,0,0,${T.dark ? '0.35' : '0.18'})`,
          borderRadius: 4, padding: '10px 9px',
          display: 'flex', flexDirection: 'column', gap: 3.5,
        }}>
          <div style={{ height: 5, background: T.dark ? 'rgba(255,255,255,0.8)' : '#1a1a2e', width: '65%', borderRadius: 1 }} />
          <div style={{ height: 2.5, background: T.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', width: '45%', borderRadius: 1 }} />
          <div style={{ height: 6 }} />
          {textPreview
            ? <div style={{ fontSize: 4.8, color: T.dark ? 'rgba(255,255,255,0.45)' : '#555', lineHeight: 1.6, overflow: 'hidden' }}>{textPreview.slice(0, 400)}</div>
            : Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{ height: 2, background: T.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', width: `${58 + (i * 11) % 42}%`, borderRadius: 1 }} />
            ))}
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          background: T.dark ? 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.25) 100%)' : 'none',
        }} />
      </div>
    )
  }

  if (item.isDirectory) {
    return (
      <div style={{
        height: 160, flexShrink: 0,
        background: T.dark
          ? `radial-gradient(ellipse at 50% 60%, rgba(${rgb},0.30) 0%, transparent 65%), #0a0816`
          : 'linear-gradient(150deg, #fdebc8, #f7d98e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {T.dark && <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 80%, rgba(${rgb},0.20) 0%, transparent 60%)`,
          filter: 'blur(20px)',
        }} />}
        <FileTile kind="folder" size={82} />
      </div>
    )
  }

  // Generic file hero
  return (
    <div style={{
      height: 160, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: T.dark
        ? `radial-gradient(ellipse at 50% 70%, rgba(${rgb},0.28) 0%, transparent 60%), #080614`
        : `radial-gradient(ellipse at 50% 60%, rgba(${rgb},0.12) 0%, transparent 60%), linear-gradient(150deg, #f0ecfa, #e8e4f5)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {T.dark && <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 90%, rgba(${rgb},0.18) 0%, transparent 55%)`,
        filter: 'blur(16px)',
      }} />}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <FileTile kind={item.kind} name={item.name} size={68} />
      </div>
    </div>
  )
}

function PvAction({ icon, label, primary, accent, onClick }) {
  const { T } = useTheme()
  const [hov, setHov] = React.useState(false)
  const rgb = accent?.rgb || '111,76,179'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: label ? 1 : 'none', height: 34,
        padding: label ? '0 14px' : '0 11px',
        border: `1px solid ${primary ? 'transparent' : T.glassBorder}`,
        background: primary
          ? accent?.c
          : (hov
            ? (T.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)')
            : (T.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.78)')),
        backdropFilter: primary ? 'none' : 'blur(14px)',
        WebkitBackdropFilter: primary ? 'none' : 'blur(14px)',
        color: primary ? '#fff' : T.textMid,
        borderRadius: 9,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontSize: 12, fontWeight: primary ? 600 : 500, cursor: 'pointer',
        boxShadow: primary
          ? `0 3px 14px rgba(${rgb},0.42), inset 0 1px 0 rgba(255,255,255,0.25)`
          : T.dark
            ? 'inset 0 1px 0 rgba(255,255,255,0.10)'
            : 'inset 0 1px 0 rgba(255,255,255,0.90)',
        transition: 'background 0.12s',
      }}>
      {icon}{label}
    </button>
  )
}
