import React from 'react'
import { basename } from '../utils.js'

export default function TitleBar({ folder, imageCount, onOpenFolder, onOpenFile, inViewer, onBackToGallery, currentImage }) {
  return (
    <div style={{
      height: 44,
      background: 'rgba(22,22,29,0.95)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      gap: 8,
      flexShrink: 0,
      WebkitAppRegion: 'drag',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="4" cy="4" r="3" stroke="white" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="2.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          </svg>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>
          {inViewer && currentImage ? basename(currentImage.name) : 'Cascade Photos'}
        </span>
      </div>

      {/* Breadcrumb */}
      {folder && (
        <span style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {inViewer
            ? `${imageCount} photos · ${basename(folder)}`
            : `${imageCount} photo${imageCount !== 1 ? 's' : ''} · ${basename(folder)}`}
        </span>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', WebkitAppRegion: 'no-drag' }}>
        {inViewer && (
          <BarBtn onClick={onBackToGallery} title="Back to gallery">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M15 8H2.414l3.293-3.293-1.414-1.414L.586 7.586a2 2 0 0 0 0 2.828l3.707 3.707 1.414-1.414L2.414 11H15z"/>
            </svg>
          </BarBtn>
        )}
        <BarBtn onClick={onOpenFolder} title="Open folder">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5z"/>
          </svg>
        </BarBtn>
        {onOpenFile && (
          <BarBtn onClick={onOpenFile} title="Open image file">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
          </BarBtn>
        )}
        <div style={{ width: 1, background: 'var(--border)', margin: '8px 2px' }} />
        <WinBtn onClick={() => window.photosAPI.minimize()} color="#ffbd2e" title="Minimise" />
        <WinBtn onClick={() => window.photosAPI.maximize()} color="#27c93f" title="Maximise" />
        <WinBtn onClick={() => window.photosAPI.close()} color="#ff5f56" title="Close" />
      </div>
    </div>
  )
}

function BarBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'transparent', border: 'none', color: 'var(--muted)',
      cursor: 'pointer', padding: '5px 8px', borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s, color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
    >{children}</button>
  )
}

function WinBtn({ onClick, color, title }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 13, height: 13, borderRadius: '50%',
      background: color, border: 'none', cursor: 'pointer',
      opacity: 0.85, transition: 'opacity 0.15s', flexShrink: 0,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
    />
  )
}
