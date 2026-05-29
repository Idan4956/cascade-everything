import React, { useState, useCallback, useRef, useEffect } from 'react'
import TitleBar from './components/TitleBar.jsx'
import NavBar from './components/NavBar.jsx'
import TabWebView from './components/TabWebView.jsx'
import SidePanel from './components/SidePanel.jsx'
import FindBar from './components/FindBar.jsx'

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
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  webview { display: flex; }
`

let tabIdCounter = 1
function makeTab(url = null) {
  return {
    id: String(tabIdCounter++),
    displayUrl: url || '',
    title: url ? 'Loading…' : 'New Tab',
    favicon: null,
    loading: !!url,
    canGoBack: false,
    canGoForward: false,
    isNewTab: !url,
    initialUrl: url || 'about:blank',
    findCount: null,
  }
}

function normalizeUrl(raw) {
  const url = raw.trim()
  if (!url) return null
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url) || url.startsWith('about:')) return url
  if (url.includes('.') && !url.includes(' ')) return 'https://' + url
  return `https://www.google.com/search?q=${encodeURIComponent(url)}`
}

export default function App() {
  const [tabs, setTabs] = useState(() => [makeTab()])
  const [activeTabId, setActiveTabId] = useState(() => tabs[0]?.id)
  const [bookmarks, setBookmarks] = useState([])
  const [history, setHistory] = useState([])
  const [downloads, setDownloads] = useState([])
  const [showPanel, setShowPanel] = useState(null)
  const [findActive, setFindActive] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [addrFocusTick, setAddrFocusTick] = useState(0)
  const webviewRefs = useRef({})

  useEffect(() => {
    window.browserAPI?.getBookmarks().then(setBookmarks)
    window.browserAPI?.getHistory().then(setHistory)
    const u1 = window.browserAPI?.onDownloadStart(d => setDownloads(prev => [...prev, d]))
    const u2 = window.browserAPI?.onDownloadDone(d => setDownloads(prev =>
      prev.map(dl => dl.savePath === d.savePath ? { ...dl, done: true, state: d.state } : dl)
    ))
    return () => { u1?.(); u2?.() }
  }, [])

  const updateTab = useCallback((id, patch) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }, [])

  const navigateTo = useCallback((tabId, rawUrl) => {
    const url = normalizeUrl(rawUrl)
    if (!url) return

    setTabs(prev => {
      const tab = prev.find(t => t.id === tabId)
      if (!tab) return prev
      if (tab.isNewTab) {
        return prev.map(t => t.id === tabId
          ? { ...t, isNewTab: false, initialUrl: url, displayUrl: url, loading: true, title: 'Loading…' }
          : t
        )
      }
      const wv = webviewRefs.current[tabId]
      if (wv) {
        wv.loadURL(url)
        return prev.map(t => t.id === tabId ? { ...t, displayUrl: url, loading: true, title: 'Loading…' } : t)
      }
      return prev
    })
  }, [])

  const handleNewTab = useCallback((url = null) => {
    const tab = makeTab(url)
    setTabs(prev => [...prev, tab])
    setActiveTabId(tab.id)
    return tab.id
  }, [])

  const handleCloseTab = useCallback((id) => {
    setTabs(prev => {
      if (prev.length === 1) {
        const fresh = makeTab()
        setActiveTabId(fresh.id)
        return [fresh]
      }
      const idx = prev.findIndex(t => t.id === id)
      const next = prev.filter(t => t.id !== id)
      setActiveTabId(cur => {
        if (cur !== id) return cur
        return next[Math.min(idx, next.length - 1)].id
      })
      delete webviewRefs.current[id]
      return next
    })
  }, [])

  const handleReload = useCallback(() => {
    setTabs(prev => {
      const tab = prev.find(t => t.id === activeTabId)
      if (tab?.loading) webviewRefs.current[activeTabId]?.stop()
      else webviewRefs.current[activeTabId]?.reload()
      return prev
    })
  }, [activeTabId])

  const handleFindChange = useCallback((q) => {
    setFindQuery(q)
    const wv = webviewRefs.current[activeTabId]
    if (!wv) return
    if (q) wv.findInPage(q, { matchCase: false })
    else wv.stopFindInPage('clearSelection')
  }, [activeTabId])

  const handleFindNav = useCallback((forward) => {
    if (!findQuery) return
    webviewRefs.current[activeTabId]?.findInPage(findQuery, { forward, findNext: true, matchCase: false })
  }, [activeTabId, findQuery])

  const handleFindClose = useCallback(() => {
    webviewRefs.current[activeTabId]?.stopFindInPage('clearSelection')
    setFindActive(false)
    setFindQuery('')
    updateTab(activeTabId, { findCount: null })
  }, [activeTabId, updateTab])

  const handleBookmarkSave = useCallback(async (bm) => {
    const updated = await window.browserAPI?.addBookmark(bm)
    if (updated) setBookmarks(updated)
  }, [])

  const handleBookmarkUpdate = useCallback(async (bm) => {
    const updated = await window.browserAPI?.updateBookmark(bm)
    if (updated) setBookmarks(updated)
  }, [])

  const handleBookmarkRemove = useCallback(async (url) => {
    const updated = await window.browserAPI?.removeBookmark(url)
    if (updated) setBookmarks(updated)
  }, [])

  const handleHistoryNavigate = useCallback((url) => {
    navigateTo(activeTabId, url)
  }, [activeTabId, navigateTo])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 't') { e.preventDefault(); handleNewTab() }
      if (mod && e.key === 'w') { e.preventDefault(); handleCloseTab(activeTabId) }
      if (mod && e.key === 'l') { e.preventDefault(); setAddrFocusTick(n => n + 1) }
      if (mod && (e.key === 'r' || e.key === 'R')) { e.preventDefault(); handleReload() }
      if (mod && e.key === 'f') { e.preventDefault(); setFindActive(true) }
      if (mod && e.key === 'b') { e.preventDefault(); setShowPanel(p => p === 'bookmarks' ? null : 'bookmarks') }
      if (mod && e.key === 'h') { e.preventDefault(); setShowPanel(p => p === 'history' ? null : 'history') }
      if (e.key === 'F5') { e.preventDefault(); handleReload() }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); webviewRefs.current[activeTabId]?.goBack() }
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); webviewRefs.current[activeTabId]?.goForward() }
      // Tab cycling
      if (mod && e.key === 'Tab') {
        e.preventDefault()
        setTabs(prev => {
          const idx = prev.findIndex(t => t.id === activeTabId)
          const next = e.shiftKey
            ? prev[(idx - 1 + prev.length) % prev.length]
            : prev[(idx + 1) % prev.length]
          setActiveTabId(next.id)
          return prev
        })
      }
      // Select tab by number
      if (mod && !e.shiftKey && !e.altKey && e.key >= '1' && e.key <= '9') {
        setTabs(prev => {
          const n = parseInt(e.key)
          const target = n === 9 ? prev[prev.length - 1] : prev[n - 1]
          if (target) setActiveTabId(target.id)
          return prev
        })
      }
      if (e.key === 'Escape' && findActive) handleFindClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTabId, findActive, findQuery, handleNewTab, handleCloseTab, handleReload, handleFindClose])

  // Update history list after navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      window.browserAPI?.getHistory().then(setHistory)
    }, 1000)
    return () => clearTimeout(timer)
  }, [tabs])

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onNewTab={() => handleNewTab()}
          onCloseTab={handleCloseTab}
        />
        <NavBar
          tab={activeTab}
          bookmarks={bookmarks}
          downloads={downloads}
          showPanel={showPanel}
          findActive={findActive}
          addrFocusTick={addrFocusTick}
          onNavigate={(url) => navigateTo(activeTabId, url)}
          onBack={() => webviewRefs.current[activeTabId]?.goBack()}
          onForward={() => webviewRefs.current[activeTabId]?.goForward()}
          onReload={handleReload}
          onHome={() => navigateTo(activeTabId, 'https://www.google.com')}
          onBookmarkSave={handleBookmarkSave}
          onBookmarkUpdate={handleBookmarkUpdate}
          onBookmarkRemove={handleBookmarkRemove}
          onTogglePanel={(p) => setShowPanel(prev => prev === p ? null : p)}
          onFind={() => setFindActive(true)}
        />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {showPanel && (
            <SidePanel
              view={showPanel}
              bookmarks={bookmarks}
              history={history}
              onNavigate={handleHistoryNavigate}
              onNewTab={handleNewTab}
              onBookmarkUpdate={handleBookmarkUpdate}
              onBookmarkRemove={handleBookmarkRemove}
              onClearHistory={async () => {
                await window.browserAPI?.clearHistory()
                setHistory([])
              }}
              onClose={() => setShowPanel(null)}
            />
          )}

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {tabs.map(tab => (
              <TabWebView
                key={tab.id}
                tab={tab}
                active={tab.id === activeTabId}
                onUpdate={updateTab}
                onNewTab={handleNewTab}
                onNavigate={navigateTo}
                webviewRefs={webviewRefs}
              />
            ))}

            {findActive && (
              <FindBar
                query={findQuery}
                count={activeTab?.findCount}
                onChange={handleFindChange}
                onNext={() => handleFindNav(true)}
                onPrev={() => handleFindNav(false)}
                onClose={handleFindClose}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
