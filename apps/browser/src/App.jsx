import React, { useState, useCallback, useRef, useEffect } from 'react'
import TitleBar from './components/TitleBar.jsx'
import NavBar from './components/NavBar.jsx'
import TabWebView from './components/TabWebView.jsx'
import SidePanel from './components/SidePanel.jsx'
import FindBar from './components/FindBar.jsx'
import TabContextMenu from './components/TabContextMenu.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import { sounds, setSoundsEnabled } from './utils/sounds.js'

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
function makeTab(url = null, workspaceId = 'ws_1') {
  return {
    id: String(tabIdCounter++),
    workspaceId,
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

const WS_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#f97316']
let wsCounter = 1
function makeWorkspace(name, color) {
  return { id: `ws_${wsCounter++}`, name: name || 'Workspace', color: color || WS_COLORS[0] }
}

function hexToRgba(hex, a) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `rgba(${r},${g},${b},${a})`
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
  const [showPalette, setShowPalette] = useState(false)
  const [splitTabId, setSplitTabId] = useState(null)
  const [adBlockEnabled, setAdBlockEnabled] = useState(true)
  const [adBlockCount, setAdBlockCount] = useState(0)
  const [adBlockDomains, setAdBlockDomains] = useState(0)
  const [workspaces, setWorkspaces] = useState([{ id: 'ws_1', name: 'Main', color: '#3b82f6' }])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws_1')
  const [sysStats, setSysStats] = useState({ cpu: 0, ram: 0, memMB: 0, netKBs: 0 })
  const [vpnConfig, setVpnConfig] = useState({ enabled: false, protocol: 'socks5', host: '', port: '1080' })
  const webviewRefs = useRef({})
  const wcIdsRef = useRef({})
  const settingsRef = useRef(settings)
  const activeWorkspaceIdRef = useRef('ws_1')

  useEffect(() => { settingsRef.current = settings }, [settings])
  useEffect(() => { activeWorkspaceIdRef.current = activeWorkspaceId }, [activeWorkspaceId])

  useEffect(() => {
    window.browserAPI?.getBookmarks().then(setBookmarks)
    window.browserAPI?.getHistory().then(setHistory)
    window.browserAPI?.getSettings().then(s => {
      if (s && Object.keys(s).length) {
        setSettings(s)
        if (s.soundsEnabled === false) setSoundsEnabled(false)
        if (s.workspaces?.length) {
          setWorkspaces(s.workspaces)
          setActiveWorkspaceId(s.workspaces[0].id)
          activeWorkspaceIdRef.current = s.workspaces[0].id
        }
      }
    })
    window.browserAPI?.getProxy().then(p => { if (p) setVpnConfig(p) })
    window.browserAPI?.getAdBlockStats().then(s => {
      if (s) { setAdBlockEnabled(s.enabled); setAdBlockCount(s.blocked); setAdBlockDomains(s.domains) }
    })
    const u1 = window.browserAPI?.onDownloadStart(d => setDownloads(prev => [...prev, d]))
    const u2 = window.browserAPI?.onDownloadDone(d => setDownloads(prev =>
      prev.map(dl => dl.savePath === d.savePath ? { ...dl, done: true, state: d.state } : dl)
    ))
    const u3 = window.browserAPI?.onAdBlockCount(n => setAdBlockCount(n))
    const u4 = window.browserAPI?.onSysStats(s => setSysStats(s))
    return () => { u1?.(); u2?.(); u3?.(); u4?.() }
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

  const handleNewTab = useCallback((url = null, wsId = null) => {
    const tab = makeTab(url, wsId || activeWorkspaceIdRef.current)
    setTabs(prev => [...prev, tab])
    setActiveTabId(tab.id)
    sounds.tabOpen()
    return tab.id
  }, [])

  const closeTabById = useCallback((id) => {
    sounds.tabClose()
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

  const handleNewTabAfter = useCallback((afterTabId) => {
    const tab = makeTab(null, activeWorkspaceIdRef.current)
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === afterTabId)
      if (idx < 0) return [...prev, tab]
      return [...prev.slice(0, idx + 1), tab, ...prev.slice(idx + 1)]
    })
    setActiveTabId(tab.id)
    sounds.tabOpen()
  }, [])

  const handleReopenClosed = useCallback(() => {
    setRecentlyClosed(rc => {
      if (!rc.length) return rc
      const last = rc[rc.length - 1]
      handleNewTab(last.url)
      return rc.slice(0, -1)
    })
  }, [handleNewTab])

  const handleSwitchWorkspace = useCallback((wsId) => {
    setActiveWorkspaceId(wsId)
    activeWorkspaceIdRef.current = wsId
    sounds.workspaceSwitch()
    setTabs(prev => {
      const wsTabs = prev.filter(t => t.workspaceId === wsId)
      if (wsTabs.length === 0) {
        const newTab = makeTab(null, wsId)
        setActiveTabId(newTab.id)
        return [...prev, newTab]
      }
      setActiveTabId(wsTabs[wsTabs.length - 1].id)
      return prev
    })
  }, [])

  const handleAddWorkspace = useCallback((name, color) => {
    const ws = makeWorkspace(name, color)
    setWorkspaces(prev => {
      const next = [...prev, ws]
      setSettings(s => {
        const updated = { ...s, workspaces: next }
        window.browserAPI?.setSettings(updated)
        return updated
      })
      return next
    })
    handleSwitchWorkspace(ws.id)
    return ws.id
  }, [handleSwitchWorkspace])

  const handleUpdateWorkspace = useCallback((wsId, patch) => {
    setWorkspaces(prev => {
      const next = prev.map(w => w.id === wsId ? { ...w, ...patch } : w)
      setSettings(s => {
        const updated = { ...s, workspaces: next }
        window.browserAPI?.setSettings(updated)
        return updated
      })
      return next
    })
  }, [])

  const handleDeleteWorkspace = useCallback((wsId) => {
    setWorkspaces(prev => {
      if (prev.length <= 1) return prev
      const next = prev.filter(w => w.id !== wsId)
      setSettings(s => {
        const updated = { ...s, workspaces: next }
        window.browserAPI?.setSettings(updated)
        return updated
      })
      // Close all tabs in this workspace
      setTabs(tabs => {
        const remaining = tabs.filter(t => t.workspaceId !== wsId)
        if (remaining.length === 0) {
          const fresh = makeTab(null, next[0].id)
          setActiveTabId(fresh.id)
          setActiveWorkspaceId(next[0].id)
          activeWorkspaceIdRef.current = next[0].id
          return [fresh]
        }
        setActiveWorkspaceId(next[0].id)
        activeWorkspaceIdRef.current = next[0].id
        setActiveTabId(remaining[remaining.length - 1].id)
        return remaining
      })
      return next
    })
  }, [])

  const handlePiP = useCallback(() => {
    const wv = webviewRefs.current[activeTabId]
    if (!wv) return
    wv.executeJavaScript(`
      (function() {
        const v = [...document.querySelectorAll('video')].find(v => !v.paused) || document.querySelector('video')
        if (v) v.requestPictureInPicture().catch(() => {})
        return !!v
      })()
    `).catch(() => {})
  }, [activeTabId])

  const handleScreenshot = useCallback(async () => {
    const wcId = wcIdsRef.current[activeTabId]
    if (!wcId) return
    sounds.screenshot()
    await window.browserAPI?.screenshot(wcId)
  }, [activeTabId])

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

  const handleSetProxy = useCallback(async (config) => {
    const result = await window.browserAPI?.setProxy(config)
    if (result) setVpnConfig(result)
  }, [])

  const handleToggleAdBlock = useCallback(async (enabled) => {
    const result = await window.browserAPI?.setAdBlockEnabled(enabled)
    setAdBlockEnabled(result ?? enabled)
  }, [])

  const handleSaveSettings = useCallback(async (s) => {
    setSettings(s)
    await window.browserAPI?.setSettings(s)
    if (s.forceDarkMode !== undefined) {
      window.browserAPI?.setForceDarkMode(s.forceDarkMode)
    }
    if (s.soundsEnabled !== undefined) {
      setSoundsEnabled(s.soundsEnabled !== false)
    }
  }, [])

  const handleSplitTab = useCallback((tabId) => {
    setSplitTabId(prev => prev === tabId ? null : tabId)
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
      if (mod && e.key === 'k') { e.preventDefault(); setShowPalette(true) }
      if (e.key === 'Escape' && showPalette) { setShowPalette(false) }
      if (e.key === 'Escape' && findActive) handleFindClose()
      if (e.key === 'Escape' && contextMenu) setContextMenu(null)
      if (e.key === 'Escape' && showSettings) setShowSettings(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTabId, findActive, findQuery, contextMenu, showSettings, showPalette, handleNewTab, handleCloseTab, handleReload, handleFindClose])

  // Update history list after navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      window.browserAPI?.getHistory().then(setHistory)
    }, 1000)
    return () => clearTimeout(timer)
  }, [tabs])

  const handleWebContentsReady = useCallback((tabId, wcId) => {
    wcIdsRef.current[tabId] = wcId
  }, [])

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0]
  const workspaceTabs = tabs.filter(t => t.workspaceId === activeWorkspaceId)
  const accent = settings.accentColor || '#3b82f6'

  return (
    <>
      <style>{styles}</style>
      {accent !== '#3b82f6' && (
        <style>{`:root {
          --accent: ${accent};
          --accent-soft: ${hexToRgba(accent, 0.15)};
          --accent-hover: ${hexToRgba(accent, 0.25)};
        }`}</style>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar
          tabs={workspaceTabs}
          allTabs={tabs}
          activeTabId={activeTabId}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectTab={setActiveTabId}
          onNewTab={() => handleNewTab()}
          onNewTabAfter={handleNewTabAfter}
          onCloseTab={handleCloseTab}
          onTabContextMenu={(e, tabId) => setContextMenu({ tabId, x: e.clientX, y: e.clientY })}
          splitTabId={splitTabId}
          onSplitTab={handleSplitTab}
          onSwitchWorkspace={handleSwitchWorkspace}
          onAddWorkspace={handleAddWorkspace}
          onUpdateWorkspace={handleUpdateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
        />
        <NavBar
          tab={activeTab}
          bookmarks={bookmarks}
          downloads={downloads}
          showPanel={showPanel}
          findActive={findActive}
          addrFocusTick={addrFocusTick}
          adBlockEnabled={adBlockEnabled}
          adBlockCount={adBlockCount}
          sysStats={sysStats}
          vpnConfig={vpnConfig}
          onSetProxy={handleSetProxy}
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
          onToggleAdBlock={handleToggleAdBlock}
          onPiP={handlePiP}
          onScreenshot={handleScreenshot}
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

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
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
                  onWebContentsReady={handleWebContentsReady}
                  webviewRefs={webviewRefs}
                  newTabBackground={settings.newTabBackground}
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
                  adBlockEnabled={adBlockEnabled}
                  adBlockCount={adBlockCount}
                  adBlockDomains={adBlockDomains}
                  onToggleAdBlock={handleToggleAdBlock}
                  onClearHistory={async () => {
                    await window.browserAPI?.clearHistory()
                    setHistory([])
                  }}
                  onClearBookmarks={handleClearBookmarks}
                />
              )}
            </div>

            {splitTabId && (() => {
              const splitTab = tabs.find(t => t.id === splitTabId)
              return splitTab ? (
                <>
                  <div style={{ width: 3, background: 'var(--border-mid)', flexShrink: 0, cursor: 'col-resize', position: 'relative', zIndex: 5 }}
                    title="Click to close split"
                    onClick={() => setSplitTabId(null)}
                  />
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <TabWebView
                      key={`split-${splitTab.id}`}
                      tab={{ ...splitTab, id: `split-${splitTab.id}` }}
                      active={true}
                      onUpdate={(id, patch) => updateTab(splitTab.id, patch)}
                      onNewTab={handleNewTab}
                      onNavigate={(_, url) => navigateTo(splitTab.id, url)}
                      onOpenSettings={() => setShowSettings(true)}
                      onWebContentsReady={(id, wcId) => handleWebContentsReady(splitTab.id, wcId)}
                      webviewRefs={webviewRefs}
                      newTabBackground={settings.newTabBackground}
                    />
                  </div>
                </>
              ) : null
            })()}
          </div>
        </div>
      </div>

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tab={tabs.find(t => t.id === contextMenu.tabId)}
          tabs={workspaceTabs}
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
          splitTabId={splitTabId}
          onSplitTab={handleSplitTab}
        />
      )}

      {showPalette && (
        <CommandPalette
          tabs={workspaceTabs}
          history={history}
          bookmarks={bookmarks}
          onSelectTab={(id) => { setActiveTabId(id); setShowPalette(false) }}
          onNavigate={(url) => { navigateTo(activeTabId, url); setShowPalette(false) }}
          onNewTab={() => { handleNewTab(); setShowPalette(false) }}
          onOpenSettings={() => { setShowSettings(true); setShowPalette(false) }}
          onTogglePanel={(p) => { setShowPanel(prev => prev === p ? null : p); setShowPalette(false) }}
          onClose={() => setShowPalette(false)}
        />
      )}
    </>
  )
}
