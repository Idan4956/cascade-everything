import React, { useEffect, useRef, useState } from 'react'
import NewTabPage from './NewTabPage.jsx'

export default function TabWebView({ tab, active, onUpdate, onNewTab, onNavigate, webviewRefs }) {
  const wvRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    return () => { delete webviewRefs.current[tab.id] }
  }, [tab.id, webviewRefs])

  useEffect(() => {
    const wv = wvRef.current
    if (!wv || !ready) return

    webviewRefs.current[tab.id] = wv

    const onStartLoad = () => onUpdate(tab.id, { loading: true })

    const onStopLoad = () => {
      onUpdate(tab.id, {
        loading: false,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
    }

    const onNavigated = (e) => {
      const url = e.url || ''
      if (url === 'about:blank') return
      onUpdate(tab.id, {
        displayUrl: url,
        isNewTab: false,
        canGoBack: wv.canGoBack(),
        canGoForward: wv.canGoForward(),
      })
      window.browserAPI?.addHistory({ url, title: tab.title || url })
    }

    const onTitle = (e) => onUpdate(tab.id, { title: e.title })

    const onFavicon = (e) => {
      if (e.favicons?.length > 0) onUpdate(tab.id, { favicon: e.favicons[0] })
    }

    const onFoundInPage = (e) => {
      if (e.result) {
        onUpdate(tab.id, {
          findCount: {
            matches: e.result.matches,
            active: e.result.activeMatchOrdinal,
          },
        })
      }
    }

    const onNewWindow = (e) => {
      e.preventDefault()
      if (e.url && e.url !== 'about:blank') onNewTab(e.url)
    }

    const onFailLoad = (e) => {
      if (e.errorCode === -3) return
      onUpdate(tab.id, { loading: false })
    }

    wv.addEventListener('did-start-loading', onStartLoad)
    wv.addEventListener('did-stop-loading', onStopLoad)
    wv.addEventListener('did-navigate', onNavigated)
    wv.addEventListener('did-navigate-in-page', onNavigated)
    wv.addEventListener('page-title-updated', onTitle)
    wv.addEventListener('page-favicon-updated', onFavicon)
    wv.addEventListener('found-in-page', onFoundInPage)
    wv.addEventListener('new-window', onNewWindow)
    wv.addEventListener('did-fail-load', onFailLoad)

    return () => {
      wv.removeEventListener('did-start-loading', onStartLoad)
      wv.removeEventListener('did-stop-loading', onStopLoad)
      wv.removeEventListener('did-navigate', onNavigated)
      wv.removeEventListener('did-navigate-in-page', onNavigated)
      wv.removeEventListener('page-title-updated', onTitle)
      wv.removeEventListener('page-favicon-updated', onFavicon)
      wv.removeEventListener('found-in-page', onFoundInPage)
      wv.removeEventListener('new-window', onNewWindow)
      wv.removeEventListener('did-fail-load', onFailLoad)
    }
  }, [ready, tab.id, onUpdate, onNewTab, webviewRefs])

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: active ? 'flex' : 'none',
      flexDirection: 'column',
    }}>
      {tab.isNewTab && (
        <NewTabPage onNavigate={(url) => onNavigate(tab.id, url)} />
      )}

      <webview
        ref={(el) => {
          wvRef.current = el
          if (el && !ready) {
            el.addEventListener('dom-ready', () => setReady(true), { once: true })
          }
        }}
        src={tab.initialUrl}
        allowpopups="true"
        style={{
          flex: 1,
          display: tab.isNewTab ? 'none' : 'flex',
        }}
      />
    </div>
  )
}
