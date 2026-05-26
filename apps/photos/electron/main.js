import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } from 'electron'
import { join } from 'path'
import fs from 'fs'
import path from 'path'

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

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 700,
    minHeight: 500,
    frame: false,
    backgroundColor: '#0f0f13',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
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
  // Serve local image files via cascade-img:// protocol
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

// ── IPC: window controls ──────────────────────────────────────────────────────

ipcMain.on('window:minimize', () => mainWin?.minimize())
ipcMain.on('window:maximize', () => mainWin?.isMaximized() ? mainWin.unmaximize() : mainWin.maximize())
ipcMain.on('window:close', () => mainWin?.close())
