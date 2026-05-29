import React, { useState, useEffect, useCallback } from 'react'
import TitleBar from './components/TitleBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import DocViewer from './components/DocViewer.jsx'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f0f13; --surface: #16161d; --surface2: #1c1c26;
    --border: rgba(255,255,255,0.06); --text: #e8e8f0; --muted: #888899;
    --accent: #3b82f6; --accent-soft: rgba(59,130,246,0.14);
  }
  html, body, #root { height: 100%; overflow: hidden; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--bg); color: var(--text);
    -webkit-font-smoothing: antialiased; user-select: none;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`

export default function App() {
  const [currentFile, setCurrentFile] = useState(null)
  const [docData, setDocData] = useState(null)
  const [recentFiles, setRecentFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    window.docsAPI.getRecent().then(setRecentFiles)
    const unsub = window.docsAPI.onOpenPath(openFile)
    return unsub
  }, [])

  const openFile = useCallback(async (filePath) => {
    setLoading(true)
    setError(null)
    setDocData(null)
    setCurrentFile(filePath)
    const data = await window.docsAPI.readFile(filePath)
    if (data.type === 'error') setError(data.message)
    else setDocData(data)
    setLoading(false)
    const recent = await window.docsAPI.addRecent(filePath)
    setRecentFiles(recent)
  }, [])

  const handleOpen = useCallback(async () => {
    const p = await window.docsAPI.openDialog()
    if (p) openFile(p)
  }, [openFile])

  const handleRemoveRecent = useCallback(async (filePath) => {
    const recent = await window.docsAPI.removeRecent(filePath)
    setRecentFiles(recent)
    if (currentFile === filePath) { setCurrentFile(null); setDocData(null) }
  }, [currentFile])

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar currentFile={currentFile} onOpen={handleOpen} />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            recentFiles={recentFiles}
            currentFile={currentFile}
            onSelect={openFile}
            onOpen={handleOpen}
            onRemove={handleRemoveRecent}
          />
          <DocViewer
            file={currentFile}
            data={docData}
            loading={loading}
            error={error}
            onOpen={handleOpen}
          />
        </div>
      </div>
    </>
  )
}
