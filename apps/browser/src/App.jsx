import React, { useState, useCallback, useRef, useEffect } from 'react'
import TitleBar from './components/TitleBar.jsx'
import NavBar from './components/NavBar.jsx'
import TabWebView from './components/TabWebView.jsx'

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
  ::-webkit-scrollbar { width: 6px; }
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
  }
}

export default function App() {
  const [tabs, setTabs] = useState(() => [makeTab()])
  const [activeTabId, setActiveTabId] = useState(() => tabs[0]?.id)
  const [bookmarks, setBookmarks] = useState([])
  const [downloads, setDownloads] = useState([])
  const webviewRefs = useRef({})

  useEffect(() => {
    window.browserAPI?.getBookmarks().then(setBookmarks)
    const u1 = window.browserAPI?.onDownloadStart(d => setDownloads(prev => [...prev, d]))
    const u2 = window.browserAPI?.onDownloadDone(d => setDownloads(prev =>
      prev.map(dl => dl.savePath === d.savePath ? { ...dl, done: true, state: d.state } : dl)
    ))
    return () => { u1?.(); u2?.() }
  }, [])

  const updateTab = useCallback((id, patch) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }, [])

  const getWebview = useCallback((id) => webviewRefs.current[id], [])

  const navigateTo = useCallback((tabId, rawUrl) => {
    let url = rawUrl.trim()
    if (!url) return
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url) && !url.startsWith('about:')) {
      url = url.includes('.') && !url.includes(' ')
        ? 'https://' + url
        : `https://www.google.com/search?q=${encodeURIComponent(url)}`
    }

    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    if (tab.isNewTab) {
      updateTab(tabId, { isNewTab: false, initialUrl: url, displayUrl: url, loading: true, title: 'Loading…' })
    } else {
      const wv = webviewRefs.current[tabId]
      if (wv) {
        wv.loadURL(url)
        updateTab(tabId, { displayUrl: url, loading: true, title: 'Loading…' })
      }
    }
    window.browserAPI?.addHistory({ url, title: 'Loading…' })
  }, [tabs, updateTab])

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

  const handleBack = useCallback(() => {
    getWebview(activeTabId)?.goBack()
  }, [activeTabId, getWebview])

  const handleForward = useCallback(() => {
    getWebview(activeTabId)?.goForward()
  }, [activeTabId, getWebview])

  const handleReload = useCallback(() => {
    const tab = tabs.find(t => t.id === activeTabId)
    if (tab?.loading) {
      getWebview(activeTabId)?.stop()
    } else {
      getWebview(activeTabId)?.reload()
    }
  }, [activeTabId, tabs, getWebview])

  const handleHome = useCallback(() => {
    navigateTo(activeTabId, 'https://www.google.com')
  }, [activeTabId, navigateTo])

  const handleBookmark = useCallback(async (tab) => {
    const isBookmarked = bookmarks.some(b => b.url === tab.displayUrl)
    let updated
    if (isBookmarked) {
      updated = await window.browserAPI?.removeBookmark(tab.displayUrl)
    } else {
      updated = await window.browserAPI?.addBookmark({
        url: tab.displayUrl,
        title: tab.title || tab.displayUrl,
        favicon: tab.favicon,
      })
    }
    if (updated) setBookmarks(updated)
  }, [bookmarks])

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]

  return (
    <>
      <style>{styles}</style>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
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
          onNavigate={(url) => navigateTo(activeTabId, url)}
          onBack={handleBack}
          onForward={handleForward}
          onReload={handleReload}
          onHome={handleHome}
          onBookmark={() => handleBookmark(activeTab)}
        />
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
        </div>
      </div>
    </>
  )
}
