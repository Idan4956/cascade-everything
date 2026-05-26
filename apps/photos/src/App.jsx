import React, { useState, useEffect, useCallback } from 'react'
import TitleBar from './components/TitleBar.jsx'
import Gallery from './components/Gallery.jsx'
import Viewer from './components/Viewer.jsx'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f0f13; --surface: #16161d; --surface2: #1c1c26;
    --border: rgba(255,255,255,0.06); --text: #e8e8f0; --muted: #888899;
    --accent: #8b5cf6; --accent-soft: rgba(139,92,246,0.14);
    --accent-glow: rgba(139,92,246,0.35);
  }
  html, body, #root { height: 100%; overflow: hidden; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--bg); color: var(--text);
    -webkit-font-smoothing: antialiased; user-select: none;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`

export default function App() {
  const [folder, setFolder] = useState(null)
  const [images, setImages] = useState([])
  const [viewerIndex, setViewerIndex] = useState(null)

  const loadFolder = useCallback(async (folderPath) => {
    const imgs = await window.photosAPI.listDir(folderPath)
    setFolder(folderPath)
    setImages(imgs)
    setViewerIndex(null)
  }, [])

  // Handle file/folder opened from Explorer or CLI
  useEffect(() => {
    const unsub = window.photosAPI.onOpenPath(async (p) => {
      const imgs = await window.photosAPI.listDir(p)
      if (imgs.length > 0) {
        setFolder(p)
        setImages(imgs)
        setViewerIndex(0)
      } else {
        // p is likely an image file, load its parent folder
        const parent = await window.photosAPI.parentDir(p)
        const parentImgs = await window.photosAPI.listDir(parent)
        const idx = parentImgs.findIndex(img => img.fullPath === p)
        setFolder(parent)
        setImages(parentImgs)
        setViewerIndex(idx >= 0 ? idx : 0)
      }
    })
    return unsub
  }, [])

  // Keyboard navigation in viewer
  useEffect(() => {
    const onKey = (e) => {
      if (viewerIndex === null) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        setViewerIndex(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        setViewerIndex(i => Math.max(i - 1, 0))
      if (e.key === 'Escape') setViewerIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewerIndex, images.length])

  const openFolder = async () => {
    const p = await window.photosAPI.openDialog(folder)
    if (p) loadFolder(p)
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar
          folder={folder}
          imageCount={images.length}
          onOpenFolder={openFolder}
          inViewer={viewerIndex !== null}
          onBackToGallery={() => setViewerIndex(null)}
          currentImage={viewerIndex !== null ? images[viewerIndex] : null}
        />
        {viewerIndex !== null ? (
          <Viewer
            images={images}
            index={viewerIndex}
            onNavigate={setViewerIndex}
            onClose={() => setViewerIndex(null)}
          />
        ) : (
          <Gallery
            images={images}
            folder={folder}
            onOpenFolder={openFolder}
            onSelect={setViewerIndex}
          />
        )}
      </div>
    </>
  )
}
