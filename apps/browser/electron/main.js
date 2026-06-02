import { app, BrowserWindow, ipcMain, shell, session } from 'electron'
import { join } from 'path'
import path from 'path'
import fs from 'fs'
import * as adblock from './adblock.js'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
let mainWin = null

function dataPath() {
  return path.join(app.getPath('userData'), 'browser-data.json')
}

function loadData() {
  try { return JSON.parse(fs.readFileSync(dataPath(), 'utf8')) }
  catch { return { bookmarks: [], history: [], settings: {} } }
}

function saveData(d) {
  try { fs.writeFileSync(dataPath(), JSON.stringify(d, null, 2)) } catch {}
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 500,
    frame: false,
    backgroundColor: '#0f0f13',
    ...(process.platform === 'darwin' && { titleBarStyle: 'hidden' }),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  })

  mainWin.on('maximize', () => mainWin.webContents.send('window:maximized', true))
  mainWin.on('unmaximize', () => mainWin.webContents.send('window:maximized', false))

  if (isDev) {
    mainWin.loadURL('http://localhost:5173')
  } else {
    mainWin.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Throttled IPC broadcast for blocked count
let countTimer = null
function broadcastCount() {
  if (countTimer) return
  countTimer = setTimeout(() => {
    mainWin?.webContents.send('browser:adBlockCount', adblock.getBlockedCount())
    countTimer = null
  }, 400)
}

app.whenReady().then(() => {
  // Load adblock list (uses cache, fetches update in background)
  adblock.loadBlocklist(app.getPath('userData'))
  const savedSettings = loadData().settings || {}
  if (savedSettings.adBlockEnabled === false) adblock.setEnabled(false)

  // Network-level ad blocking
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['<all_urls>'] }, (details, callback) => {
    if (adblock.shouldBlock(details.url)) {
      broadcastCount()
      callback({ cancel: true })
    } else {
      callback({})
    }
  })

  // Cosmetic CSS injection into every webview page
  app.on('web-contents-created', (_, contents) => {
    contents.on('did-finish-load', () => {
      if (adblock.isEnabled()) {
        contents.insertCSS(adblock.AD_CSS).catch(() => {})
      }
    })
  })

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const safe = ['notifications', 'clipboard-read', 'clipboard-sanitized-write']
    callback(safe.includes(permission))
  })

  session.defaultSession.on('will-download', (event, item) => {
    const filename = item.getFilename()
    const savePath = path.join(app.getPath('downloads'), filename)
    item.setSavePath(savePath)

    mainWin?.webContents.send('browser:downloadStart', {
      id: Date.now(),
      filename,
      savePath,
      total: item.getTotalBytes(),
    })

    item.on('updated', (_, state) => {
      if (state === 'progressing' && !item.isPaused()) {
        mainWin?.webContents.send('browser:downloadProgress', {
          savePath,
          received: item.getReceivedBytes(),
          total: item.getTotalBytes(),
        })
      }
    })

    item.once('done', (_, state) => {
      mainWin?.webContents.send('browser:downloadDone', { savePath, state })
      if (state === 'completed') shell.showItemInFolder(savePath)
    })
  })

  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

ipcMain.handle('browser:getBookmarks', () => loadData().bookmarks)

ipcMain.handle('browser:addBookmark', (_, bm) => {
  const d = loadData()
  if (!d.bookmarks.find(b => b.url === bm.url)) {
    d.bookmarks.unshift({ ...bm, tags: bm.tags || [], added: Date.now() })
  }
  saveData(d)
  return d.bookmarks
})

ipcMain.handle('browser:updateBookmark', (_, bm) => {
  const d = loadData()
  const idx = d.bookmarks.findIndex(b => b.url === bm.url)
  if (idx >= 0) d.bookmarks[idx] = { ...d.bookmarks[idx], ...bm }
  else d.bookmarks.unshift({ ...bm, tags: bm.tags || [], added: Date.now() })
  saveData(d)
  return d.bookmarks
})

ipcMain.handle('browser:removeBookmark', (_, url) => {
  const d = loadData()
  d.bookmarks = d.bookmarks.filter(b => b.url !== url)
  saveData(d)
  return d.bookmarks
})

ipcMain.handle('browser:getHistory', () => loadData().history.slice(0, 500))

ipcMain.handle('browser:addHistory', (_, entry) => {
  const d = loadData()
  d.history = [{ ...entry, time: Date.now() }, ...d.history.filter(h => h.url !== entry.url)].slice(0, 2000)
  saveData(d)
  return true
})

ipcMain.handle('browser:clearHistory', () => {
  const d = loadData()
  d.history = []
  saveData(d)
  return true
})

ipcMain.handle('browser:getSettings', () => loadData().settings || {})

ipcMain.handle('browser:setSettings', (_, settings) => {
  const d = loadData()
  d.settings = settings
  saveData(d)
  return true
})

ipcMain.on('window:minimize', () => mainWin?.minimize())
ipcMain.on('window:maximize', () => mainWin?.isMaximized() ? mainWin.unmaximize() : mainWin.maximize())
ipcMain.on('window:close', () => mainWin?.close())

ipcMain.handle('browser:getAdBlockStats', () => ({
  enabled: adblock.isEnabled(),
  blocked: adblock.getBlockedCount(),
  domains: adblock.getDomainCount(),
}))

ipcMain.handle('browser:setAdBlockEnabled', (_, enabled) => {
  adblock.setEnabled(enabled)
  const d = loadData()
  d.settings = { ...(d.settings || {}), adBlockEnabled: enabled }
  saveData(d)
  return adblock.isEnabled()
})

ipcMain.handle('browser:resetAdBlockCount', () => {
  adblock.resetCount()
  return 0
})
