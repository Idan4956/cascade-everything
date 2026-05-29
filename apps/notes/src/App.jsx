import React, { useState, useEffect, useCallback, useRef } from 'react'
import TitleBar from './components/TitleBar.jsx'
import NoteList from './components/NoteList.jsx'
import Editor from './components/Editor.jsx'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f0f13; --surface: #16161d; --surface2: #1c1c26;
    --border: rgba(255,255,255,0.06); --text: #e8e8f0; --muted: #888899;
    --accent: #10b981; --accent-soft: rgba(16,185,129,0.14);
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
  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const saveTimer = useRef(null)
  const currentPath = useRef(null)

  const refreshNotes = useCallback(async () => {
    const list = await window.notesAPI.list()
    setNotes(list)
    return list
  }, [])

  useEffect(() => { refreshNotes() }, [])

  const selectNote = useCallback(async (note) => {
    setSelectedId(note.id)
    currentPath.current = note.path
    const text = await window.notesAPI.read(note.path)
    setContent(text)
  }, [])

  const handleContentChange = useCallback((text) => {
    setContent(text)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (currentPath.current) {
        await window.notesAPI.write(currentPath.current, text)
        const list = await refreshNotes()
        // keep selection stable
        setSelectedId(id => {
          const still = list.find(n => n.id === id)
          return still ? id : id
        })
      }
    }, 600)
  }, [refreshNotes])

  const handleNew = useCallback(async () => {
    const note = await window.notesAPI.create('Untitled')
    const list = await refreshNotes()
    const found = list.find(n => n.id === note.id)
    if (found) selectNote(found)
  }, [refreshNotes, selectNote])

  const handleDelete = useCallback(async (note) => {
    await window.notesAPI.delete(note.path)
    if (selectedId === note.id) {
      setSelectedId(null)
      setContent('')
      currentPath.current = null
    }
    refreshNotes()
  }, [selectedId, refreshNotes])

  const handleSearch = useCallback(async (q) => {
    setSearch(q)
    if (!q.trim()) { setSearchResults(null); return }
    const results = await window.notesAPI.search(q)
    setSearchResults(results)
  }, [])

  const displayedNotes = searchResults !== null ? searchResults : notes
  const selectedNote = displayedNotes.find(n => n.id === selectedId) || notes.find(n => n.id === selectedId)

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar
          noteTitle={selectedNote?.title}
          onNew={handleNew}
          search={search}
          onSearch={handleSearch}
        />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <NoteList
            notes={displayedNotes}
            selectedId={selectedId}
            onSelect={selectNote}
            onNew={handleNew}
            onDelete={handleDelete}
          />
          <Editor
            content={content}
            onChange={handleContentChange}
            active={!!selectedId}
            noteTitle={selectedNote?.title}
          />
        </div>
      </div>
    </>
  )
}
