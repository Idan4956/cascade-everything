import React, { useState, useCallback, useRef, useEffect } from 'react'
import TitleBar from './components/TitleBar.jsx'
import NavBar from './components/NavBar.jsx'
import TabWebView from './components/TabWebView.jsx'
import SidePanel from './components/SidePanel.jsx'
import FindBar from './components/FindBar.jsx'
import TabContextMenu from './components/TabContextMenu.jsx'
import SettingsPage from './components/SettingsPage.jsx'

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #131313;
    --chrome: #1d1d1d;
    --surface: #252525;
    --surface2: #2e2e2e;
    --surface3: #393939;
    --border: rgba(255,255,255,0.07);
    --border-mid: rgba(255,255,255,0.12);
    --text: rgba(255,255,255,0.9);
    --muted: rgba(255,255,255,0.5);
    --accent: #3b82f6;
    --accent-soft: rgba(59,130,246,0.15);
    --accent-hover: rgba(59,130,246,0.25);
  }
  html, body, #root { height: 100%; overflow: hidden; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--bg); color: var(--text);
    -webkit-font-smoothing: antialiased; user-select: none;
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
  webview { display: flex; }
  input { box-sizing: border-box; }
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

const SEARCH_URLS = {
  google: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  bing: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  brave: q => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
}

function normalizeUrl(raw, searchEngine = 'google') {
  const url = raw.trim()
  if (!url) return null
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url) || url.startsWith('about:')) return url
  if (url.includes('.') && !url.includes(' ')) return 'https://' + url
  return (SEARCH_URLS[searchEngine] || SEARCH_URLS.google)(url)
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
  const [contextMenu, setContextMenu] = useState(null)
  const [recentlyClosed, setRecentlyClosed] = useState([])
  const [settings, setSettings] = useState({ searchEngine: 'google' })
  const [showSettings, setShowSettings] = useState(false)
  const webviewRefs = useRef({})
  const settingsRef = useRef(settings)

  useEffect(() => { settingsRef.current = settings }, [settings])

  useEffect(() => {
    window.browserAPI?.getBookmarks().then(setBookmarks)
    window.browserAPI?.getHistory().then(setHistory)
    window.browserAPI?.getSettings().then(s => { if (s && Object.keys(s).length) setSettings(s) })
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
    const url = normalizeUrl(rawUrl, settingsRef.current?.searchEngine)
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

  const closeTabById = useCallback((id) => {
    setTabs(prev => {
      const tab = prev.find(t => t.id === id)
      if (tab && !tab.isNewTab && tab.displayUrl) {
        setRecentlyClosed(rc => [...rc.slice(-9), { url: tab.displayUrl, title: tab.title, favicon: tab.favicon }])
      }
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

  const handleCloseTab = closeTabById

  const handleDuplicateTab = useCallback((id) => {
    setTabs(prev => {
      const tab = prev.find(t => t.id === id)
      if (!tab) return prev
      const dup = makeTab(tab.displayUrl || null)
      const idx = prev.findIndex(t => t.id === id)
      const next = [...prev.slice(0, idx + 1), dup, ...prev.slice(idx + 1)]
      setActiveTabId(dup.id)
      return next
    })
  }, [])

  const handlePinTab = useCallback((id) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t))
  }, [])

  const handleReloadTab = useCallback((id) => {
    setTabs(prev => {
      const tab = prev.find(t => t.id === id)
      if (!tab) return prev
      if (tab.loading) webviewRefs.current[id]?.stop()
      else webviewRefs.current[id]?.reload()
      return prev
    })
  }, [])

  const handleCloseOtherTabs = useCallback((id) => {
    setTabs(prev => {
      const tab = prev.find(t => t.id === id)
      if (!tab) return prev
      prev.filter(t => t.id !== id).forEach(t => { delete webviewRefs.current[t.id] })
      setActiveTabId(id)
      return [tab]
    })
  }, [])

  const handleCloseTabsToRight = useCallback((id) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id)
      if (idx < 0) return prev
      prev.slice(idx + 1).forEach(t => { delete webviewRefs.current[t.id] })
      const next = prev.slice(0, idx + 1)
      setActiveTabId(cur => next.find(t => t.id === cur) ? cur : next[next.length - 1].id)
      return next
    })
  }, [])

  const handleReopenClosed = useCallback(() => {
    setRecentlyClosed(rc => {
      if (!rc.length) return rc
      const last = rc[rc.length - 1]
      handleNewTab(last.url)
      return rc.slice(0, -1)
    })
  }, [handleNewTab])

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

  const handleSaveSettings = useCallback(async (s) => {
    setSettings(s)
    await window.browserAPI?.setSettings(s)
  }, [])

  const handleClearBookmarks = useCallback(async () => {
    for (const bm of bookmarks) {
      await window.browserAPI?.removeBookmark(bm.url)
    }
    setBookmarks([])
  }, [bookmarks])

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
      if (e.key === 'Escape' && contextMenu) setContextMenu(null)
      if (e.key === 'Escape' && showSettings) setShowSettings(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTabId, findActive, findQuery, contextMenu, showSettings, handleNewTab, handleCloseTab, handleReload, handleFindClose])

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
          onTabContextMenu={(e, tabId) => setContextMenu({ tabId, x: e.clientX, y: e.clientY })}
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
                onOpenSettings={() => setShowSettings(true)}
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

            {showSettings && (
              <SettingsPage
                settings={settings}
                onSave={handleSaveSettings}
                onClose={() => setShowSettings(false)}
                onClearHistory={async () => {
                  await window.browserAPI?.clearHistory()
                  setHistory([])
                }}
                onClearBookmarks={handleClearBookmarks}
              />
            )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tab={tabs.find(t => t.id === contextMenu.tabId)}
          tabs={tabs}
          recentlyClosed={recentlyClosed}
          onClose={() => setContextMenu(null)}
          onNewTab={() => handleNewTab()}
          onDuplicate={handleDuplicateTab}
          onPin={handlePinTab}
          onReloadTab={handleReloadTab}
          onCloseTab={handleCloseTab}
          onCloseOthers={handleCloseOtherTabs}
          onCloseToRight={handleCloseTabsToRight}
          onReopenClosed={handleReopenClosed}
        />
      )}
    </>
  )
}
