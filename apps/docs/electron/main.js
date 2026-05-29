import { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } from 'electron'
import { join } from 'path'
import fs from 'fs'
import path from 'path'
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'

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

function recentPath() {
  return path.join(app.getPath('userData'), 'recent-docs.json')
}

function loadRecent() {
  try { return JSON.parse(fs.readFileSync(recentPath(), 'utf8')) } catch { return [] }
}

function saveRecent(files) {
  try { fs.writeFileSync(recentPath(), JSON.stringify(files)) } catch {}
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 720,
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
      mainWin.webContents.send('docs:openPath', launchPath)
    })
  }
}

app.whenReady().then(() => {
  // Serve local files via custom protocol for PDF rendering
  protocol.handle('cascade-doc', (request) => {
    const filePath = decodeURIComponent(request.url.slice('cascade-doc://'.length))
    return net.fetch('file:///' + filePath)
  })
  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

ipcMain.handle('docs:openDialog', async () => {
  const result = await dialog.showOpenDialog(mainWin, {
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['pdf', 'docx', 'xlsx', 'xls', 'txt', 'md', 'csv', 'json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  })
  return result.filePaths[0] || null
})

ipcMain.handle('docs:readFile', async (_, filePath) => {
  const ext = path.extname(filePath).toLowerCase()
  try {
    if (ext === '.pdf') {
      // Serve via protocol so Chromium can render the PDF natively
      const normalized = filePath.replace(/\\/g, '/')
      return { type: 'pdf', url: 'cascade-doc://' + encodeURIComponent(normalized) }
    }
    if (ext === '.docx') {
      const result = await mammoth.convertToHtml({ path: filePath })
      return { type: 'html', html: result.value }
    }
    if (ext === '.xlsx' || ext === '.xls') {
      const wb = XLSX.readFile(filePath)
      const sheets = wb.SheetNames.map(name => ({
        name,
        html: XLSX.utils.sheet_to_html(wb.Sheets[name]),
      }))
      return { type: 'spreadsheet', sheets }
    }
    if (ext === '.csv') {
      const content = fs.readFileSync(filePath, 'utf8')
      const wb = XLSX.read(content, { type: 'string' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      return { type: 'spreadsheet', sheets: [{ name: path.basename(filePath), html: XLSX.utils.sheet_to_html(sheet) }] }
    }
    const content = fs.readFileSync(filePath, 'utf8')
    return { type: ext === '.md' ? 'markdown' : 'text', content }
  } catch (e) {
    return { type: 'error', message: e.message }
  }
})

ipcMain.handle('docs:getRecent', () => loadRecent())

ipcMain.handle('docs:addRecent', (_, filePath) => {
  let recent = loadRecent().filter(f => f !== filePath)
  recent.unshift(filePath)
  saveRecent(recent.slice(0, 20))
  return recent.slice(0, 20)
})

ipcMain.handle('docs:removeRecent', (_, filePath) => {
  const recent = loadRecent().filter(f => f !== filePath)
  saveRecent(recent)
  return recent
})

ipcMain.handle('docs:showInFolder', (_, filePath) => shell.showItemInFolder(filePath))
ipcMain.handle('docs:openExternal', (_, filePath) => shell.openPath(filePath))

ipcMain.handle('docs:stat', (_, filePath) => {
  try {
    const s = fs.statSync(filePath)
    return { name: path.basename(filePath), size: s.size, mtime: s.mtime.toISOString(), exists: true }
  } catch { return { exists: false } }
})

ipcMain.handle('docs:writeFile', (_, filePath, content) => {
  try { fs.writeFileSync(filePath, content, 'utf8'); return { ok: true } }
  catch (e) { return { ok: false, error: e.message } }
})

ipcMain.on('window:minimize', () => mainWin?.minimize())
ipcMain.on('window:maximize', () => mainWin?.isMaximized() ? mainWin.unmaximize() : mainWin.maximize())
ipcMain.on('window:close', () => mainWin?.close())
