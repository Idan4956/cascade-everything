import React, { useState } from 'react'

export default function Gallery({ images, folder, onOpenFolder, onSelect }) {
  const [hovered, setHovered] = useState(null)

  if (!folder) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="m21 15-5-5L5 21"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Open a folder to get started</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Browse your photos in a beautiful, fast gallery</div>
        </div>
        <button onClick={onOpenFolder} style={{
          marginTop: 8, padding: '10px 22px', borderRadius: 10,
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Open folder
        </button>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 15, color: 'var(--muted)' }}>No images found in this folder</div>
        <button onClick={onOpenFolder} style={{
          padding: '8px 18px', borderRadius: 8,
          background: 'rgba(255,255,255,0.06)', color: 'var(--text)',
          border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13,
        }}>Open different folder</button>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8,
      }}>
        {images.map((img, i) => (
          <div
            key={img.fullPath}
            onClick={() => onSelect(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              aspectRatio: '1',
              borderRadius: 10,
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'var(--surface)',
              border: `1px solid ${hovered === i ? 'var(--accent)' : 'var(--border)'}`,
              position: 'relative',
              transition: 'border-color 0.15s, transform 0.15s',
              transform: hovered === i ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <img
              src={img.url}
              alt={img.name}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {hovered === i && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '20px 8px 7px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                fontSize: 11, color: '#fff',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {img.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
