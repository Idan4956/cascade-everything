import React from 'react'
import { FileTile, kindLabel, IconEye, IconShare, IconStar, IconCopy, IconMore, IconPlus } from './icons'
import { AIActions } from './features'
import { useTheme } from '../contexts/ThemeContext'

const HUE_PRESETS = [15, 45, 80, 145, 185, 235, 290, 330]

export default function CascadeDeepPreview({ item, accent, tagMap, onToggleTag, tagDefs = [], onAddTag }) {
  const { T } = useTheme()

  if (!item) return (
    <div style={{
      flex: 1, minWidth: 300,
      background: T.glassPreviewBg,
      backdropFilter: T.glassBlur,
      WebkitBackdropFilter: T.glassBlur,
      borderLeft: `1px solid ${T.glassBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: T.textDim, fontSize: 13, flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: T.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        border: `1px solid ${T.glassBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <FileTile kind="folder" size={32} />
      </div>
      <span style={{ fontSize: 12.5 }}>Select a file to preview</span>
    </div>
  )

  return (
    <div style={{
      flex: 1, minWidth: 300,
      background: T.glassPreviewBg,
      backdropFilter: T.glassBlur,
      WebkitBackdropFilter: T.glassBlur,
      borderLeft: `1px solid ${T.glassBorder}`,
      display: 'flex', flexDirection: 'column', overflow: 'auto',
      scrollSnapAlign: 'start',
    }}>
      <PreviewHero item={item} accent={accent} />

      {/* Name + kind */}
      <div style={{ padding: '16px 18px 8px' }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: T.text, wordBreak: 'break-word', lineHeight: 1.3 }}>
          {item.name}
        </div>
        <div style={{ fontSize: 12, color: T.textSub, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase',
            padding: '2px 7px', borderRadius: 4,
            background: T.dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
            color: T.textSub,
          }}>{kindLabel(item.kind)}</span>
          {item.size && <span style={{ color: T.textDim }}>·</span>}
          {item.size && <span>{item.size}</span>}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '6px 14px 12px', display: 'flex', gap: 5 }}>
        <PvAction icon={<IconEye size={13} />} label="Open" primary accent={accent}
          onClick={() => window.electronAPI?.openExternal(item.path)} />
        <PvAction icon={<IconShare size={13} />} accent={accent}
          onClick={() => window.electronAPI?.showInFolder(item.path)} />
        <PvAction icon={<IconCopy size={13} />} accent={accent}
          onClick={() => navigator.clipboard?.writeText(item.path)} />
        <PvAction icon={<IconMore size={13} />} accent={accent} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: T.glassBorder, margin: '0 14px' }} />

      {/* Metadata glass card */}
      <div style={{
        margin: '12px 14px',
        padding: '2px 12px',
        background: T.dark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 10,
        border: `1px solid ${T.glassBorder}`,
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
            display: 'flex', fontSize: 11.5, padding: '7px 0',
            borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <div style={{ width: 76, color: T.textDim, flexShrink: 0, fontWeight: 500 }}>{k}</div>
            <div style={{
              flex: 1, color: T.textMid,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: k === 'Path' ? 'nowrap' : 'normal',
            }}>{String(v)}</div>
          </div>
        ))}
      </div>

      {/* Inline tag editor */}
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
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, letterSpacing: 0.6, padding: '6px 0 8px', textTransform: 'uppercase' }}>Tags</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tagDefs.map(t => {
          const active = activeTags.includes(t.id)
          return (
            <button key={t.id} onClick={() => onToggleTag?.(item.path, t.id)} style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 99,
              background: active ? `oklch(0.94 0.05 ${t.hue})` : (T.dark ? 'rgba(255,255,255,0.06)' : 'transparent'),
              color: active ? `oklch(0.35 0.14 ${t.hue})` : T.textSub,
              border: active ? `1px solid oklch(0.86 0.06 ${t.hue})` : `1px solid ${T.glassBorder}`,
              cursor: 'pointer', fontWeight: active ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 5,
              backdropFilter: !active ? 'blur(8px)' : 'none',
              transition: 'all 0.12s',
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
            background: addingTag ? `rgba(${accent?.rgb || '111,76,179'},0.12)` : (T.dark ? 'rgba(255,255,255,0.06)' : 'transparent'),
            color: addingTag ? accent?.c : T.textSub,
            border: addingTag ? `1px solid rgba(${accent?.rgb || '111,76,179'},0.35)` : `1px solid ${T.glassBorder}`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            backdropFilter: 'blur(8px)',
          }}>
          <IconPlus size={9} /> New tag
        </button>
      </div>

      {addingTag && (
        <div style={{
          marginTop: 8, padding: '10px 12px',
          background: T.dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 10,
          border: `1px solid ${T.glassBorder}`,
        }}>
          <input
            autoFocus
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingTag(false) }}
            placeholder="Tag name…"
            style={{
              width: '100%', height: 28, padding: '0 9px',
              border: `1px solid ${T.inputBorder}`, borderRadius: 6,
              fontSize: 12, outline: 'none', background: T.inputBg,
              color: T.text, boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
            {HUE_PRESETS.map(hue => (
              <button key={hue} onClick={() => setNewTagHue(hue)} style={{
                width: 16, height: 16, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: `oklch(0.62 0.16 ${hue})`,
                outline: newTagHue === hue ? `2px solid oklch(0.35 0.14 ${hue})` : 'none',
                outlineOffset: 1,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
            <button onClick={handleAdd} style={{
              flex: 1, height: 26, border: 'none', borderRadius: 6,
              background: accent?.c || '#6f4cb3', color: '#fff',
              fontSize: 11, cursor: 'pointer', fontWeight: 600,
              boxShadow: `0 2px 8px rgba(${accent?.rgb || '111,76,179'},0.35)`,
            }}>Add</button>
            <button onClick={() => setAddingTag(false)} style={{
              flex: 1, height: 26, border: `1px solid ${T.glassBorder}`, borderRadius: 6,
              background: T.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
              color: T.textSub, fontSize: 11, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewHero({ item, accent }) {
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

  if (item.kind === 'image') {
    return (
      <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
        <img
          src={`file://${item.path}`}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
        <div style={{
          position: 'absolute', inset: 'auto 0 0 0', height: 48,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.35))',
        }} />
      </div>
    )
  }

  if (item.kind === 'video') {
    return (
      <div style={{ height: 200, background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <video
          src={`file://${item.path}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => e.currentTarget.style.display = 'none'}
        />
        <div style={{
          width: 54, height: 54, borderRadius: 99, zIndex: 2,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M7 4l13 8-13 8z" /></svg>
        </div>
      </div>
    )
  }

  if (item.kind === 'audio') {
    return (
      <div style={{
        height: 180,
        background: `linear-gradient(135deg, rgba(${rgb},0.35) 0%, rgba(${rgb},0.12) 100%), #0d0b18`,
        display: 'flex', alignItems: 'flex-end', padding: '16px 14px 16px', gap: 1.5,
        position: 'relative', overflow: 'hidden',
      }}>
        {Array.from({ length: 52 }).map((_, i) => {
          const h = 8 + Math.abs(Math.sin(i * 0.52 + i * 0.14) * 58) + Math.abs(Math.cos(i * 0.31) * 28)
          return <div key={i} style={{
            flex: 1, height: Math.min(h, 110),
            background: i < 20
              ? `rgba(${rgb}, 0.9)`
              : `rgba(${rgb}, 0.3)`,
            borderRadius: 2,
          }} />
        })}
        <div style={{
          position: 'absolute', top: 14, left: 16, fontSize: 12,
          color: 'rgba(255,255,255,0.8)', fontWeight: 600,
        }}>{item.name}</div>
      </div>
    )
  }

  if (item.kind === 'text' && textPreview) {
    return (
      <div style={{
        height: 220, padding: '16px 18px',
        fontFamily: 'ui-monospace, "SF Mono", Consolas, monospace',
        fontSize: 11, color: T.text,
        whiteSpace: 'pre-wrap', overflow: 'hidden',
        position: 'relative', lineHeight: 1.6, background: T.codeBg,
      }}>
        {textPreview}
        <div style={{
          position: 'absolute', inset: 'auto 0 0 0', height: 64,
          background: `linear-gradient(transparent, ${T.codeBg})`,
        }} />
      </div>
    )
  }

  if (item.kind === 'pdf' || item.kind === 'doc' || item.kind === 'sheet') {
    return (
      <div style={{
        height: 220,
        background: T.dark
          ? `linear-gradient(145deg, rgba(${rgb},0.12) 0%, rgba(${rgb},0.04) 100%)`
          : 'linear-gradient(180deg, #f5f2ec, #ede9e1)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
      }}>
        <div style={{
          width: 120, aspectRatio: '8.5/11',
          background: T.dark ? 'rgba(255,255,255,0.08)' : '#fff',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${T.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
          boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
          borderRadius: 3, padding: 10,
          display: 'flex', flexDirection: 'column', gap: 3.5,
        }}>
          <div style={{ height: 5.5, background: T.dark ? 'rgba(255,255,255,0.8)' : '#222', width: '68%', borderRadius: 1 }} />
          <div style={{ height: 2.5, background: T.dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', width: '48%', borderRadius: 1 }} />
          <div style={{ height: 7 }} />
          {textPreview
            ? <div style={{ fontSize: 5, color: T.dark ? 'rgba(255,255,255,0.5)' : '#555', lineHeight: 1.6, overflow: 'hidden' }}>{textPreview.slice(0, 400)}</div>
            : Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ height: 2, background: T.dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', width: `${60 + (i * 13) % 40}%`, borderRadius: 1 }} />
            ))}
        </div>
      </div>
    )
  }

  if (item.isDirectory) {
    return (
      <div style={{
        height: 160,
        background: T.dark
          ? `linear-gradient(145deg, rgba(${rgb},0.20) 0%, rgba(${rgb},0.06) 100%)`
          : 'linear-gradient(145deg, #fdeec7, #f5d98a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        overflow: 'hidden',
      }}>
        <FileTile kind="folder" size={80} />
        <div style={{
          position: 'absolute', inset: 0,
          background: T.dark
            ? 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
        }} />
      </div>
    )
  }

  // Generic file hero with gradient
  return (
    <div style={{
      height: 160,
      background: T.dark
        ? `linear-gradient(145deg, rgba(${rgb},0.18) 0%, rgba(${rgb},0.06) 100%)`
        : `linear-gradient(145deg, rgba(${rgb},0.10) 0%, rgba(${rgb},0.03) 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
    }}>
      <FileTile kind={item.kind} name={item.name} size={66} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
      }} />
    </div>
  )
}

function PvAction({ icon, label, primary, accent, onClick }) {
  const { T } = useTheme()
  const [hov, setHov] = React.useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: label ? 1 : 'none', height: 32,
        padding: label ? '0 14px' : '0 10px',
        border: `1px solid ${primary ? accent.c : T.glassBorder}`,
        background: primary
          ? accent.c
          : (hov
            ? (T.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)')
            : (T.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)')),
        backdropFilter: primary ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: primary ? 'none' : 'blur(12px)',
        color: primary ? '#fff' : T.textMid,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontSize: 12, fontWeight: primary ? 600 : 500, cursor: 'pointer',
        boxShadow: primary ? `0 2px 12px rgba(${accent.rgb},0.35)` : 'none',
        transition: 'background 0.1s, box-shadow 0.1s',
      }}>
      {icon}{label}
    </button>
  )
}
