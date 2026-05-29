import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } from 'electron'
import { join } from 'path'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.avif'])
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
let mainWin = null

function getLaunchPath() {
  const args = process.argv.slice(app.isPackaged ? 1 : 2)
  for (const arg of args) {
    if (!arg.startsWith('-')) {
      try { if (fs.existsSync(arg)) return arg } catch {}
    }
  }
  return null
}

function resolveFromWinShortcut(name) {
  const lnkPaths = [
    path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs', `${name}.lnk`),
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs', `${name}.lnk`),
  ]
  for (const lnk of lnkPaths) {
    try {
      if (fs.existsSync(lnk)) {
        const info = shell.readShortcutLink(lnk)
        if (info.target && fs.existsSync(info.target)) return info.target
      }
    } catch {}
  }
  return null
}

function findCascadeExplorer() {
  const p = process.platform
  const home = os.homedir()
  let candidates = []
  if (p === 'win32') {
    const fromShortcut = resolveFromWinShortcut('Cascade')
    if (fromShortcut) return fromShortcut
    candidates = [
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Cascade', 'Cascade.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Cascade', 'Cascade.exe'),
    ]
  } else if (p === 'darwin') {
    candidates = [
      '/Applications/Cascade.app/Contents/MacOS/Cascade',
      path.join(home, 'Applications', 'Cascade.app', 'Contents', 'MacOS', 'Cascade'),
    ]
  } else {
    candidates = [
      path.join(home, 'Applications', 'Cascade-Explorer-linux.AppImage'),
      path.join(home, 'Downloads', 'Cascade-Explorer-linux.AppImage'),
      '/opt/Cascade-Explorer-linux.AppImage',
    ]
  }
  return candidates.find(c => { try { return fs.statSync(c).isFile() } catch { return false } }) || null
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    backgroundColor: '#0f0f13',
    ...(process.platform === 'darwin' && { titleBarStyle: 'hidden' }),
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWin.on('maximize', () => mainWin.webContents.send('window:maximized', true))
  mainWin.on('unmaximize', () => mainWin.webContents.send('window:maximized', false))

  if (isDev) {
    mainWin.loadURL('http://localhost:5173')
  } else {
    mainWin.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const launchPath = getLaunchPath()
  if (launchPath) {
    mainWin.webContents.once('did-finish-load', () => {
      mainWin.webContents.send('open-path', launchPath)
    })
  }
}

app.whenReady().then(() => {
  protocol.handle('cascade-img', (request) => {
    const filePath = decodeURIComponent(request.url.slice('cascade-img://'.length))
    return net.fetch('file:///' + filePath)
  })
  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// ── IPC: folder / file listing ────────────────────────────────────────────────

ipcMain.handle('photos:openDialog', async (_, startPath) => {
  const result = await dialog.showOpenDialog(mainWin, {
    defaultPath: startPath || app.getPath('pictures'),
    properties: ['openDirectory'],
  })
  return result.filePaths[0] || null
})

ipcMain.handle('photos:openFileDialog', async (_, startPath) => {
  const result = await dialog.showOpenDialog(mainWin, {
    defaultPath: startPath || app.getPath('pictures'),
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','gif','webp','bmp','tiff','tif','avif'] }],
  })
  return result.filePaths[0] || null
})

ipcMain.handle('photos:listDir', (_, dirPath) => {
  try {
    return fs.readdirSync(dirPath)
      .filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .map(f => {
        const full = path.join(dirPath, f)
        const stat = fs.statSync(full)
        return {
          name: f,
          fullPath: full,
          url: 'cascade-img://' + encodeURIComponent(full.replace(/\\/g, '/')),
          size: stat.size,
          mtime: stat.mtimeMs,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  } catch { return [] }
})

ipcMain.handle('photos:parentDir', (_, dirPath) => path.dirname(dirPath))

ipcMain.handle('photos:openExternal', (_, filePath) => shell.showItemInFolder(filePath))

// ── IPC: inter-app ────────────────────────────────────────────────────────────

ipcMain.handle('photos:openInExplorer', async (_, filePath) => {
  const explorerPath = findCascadeExplorer()
  if (explorerPath) {
    try {
      spawn(explorerPath, [path.dirname(filePath)], { detached: true }).unref()
      return { ok: true }
    } catch {}
  }
  shell.showItemInFolder(filePath)
  return { ok: true, fallback: true }
})

// ── IPC: image conversion ─────────────────────────────────────────────────────

ipcMain.handle('photos:saveDialog', async (_, { defaultName, ext }) => {
  const extMap = { jpg: 'JPEG', jpeg: 'JPEG', png: 'PNG', webp: 'WebP' }
  const result = await dialog.showSaveDialog(mainWin, {
    defaultPath: defaultName,
    filters: [{ name: extMap[ext] || ext.toUpperCase(), extensions: [ext] }],
  })
  return result.filePath || null
})

ipcMain.handle('photos:saveConverted', async (_, { buffer, outputPath }) => {
  try {
    fs.writeFileSync(outputPath, Buffer.from(buffer))
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
})

// ── IPC: window controls ──────────────────────────────────────────────────────

ipcMain.on('window:minimize', () => mainWin?.minimize())
ipcMain.on('window:maximize', () => mainWin?.isMaximized() ? mainWin.unmaximize() : mainWin.maximize())
ipcMain.on('window:close', () => mainWin?.close())
