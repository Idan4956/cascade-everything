import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import fs from 'fs'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
let mainWin = null

function settingsPath() {
  return path.join(app.getPath('userData'), 'notes-settings.json')
}

function loadSettings() {
  try { return JSON.parse(fs.readFileSync(settingsPath(), 'utf8')) } catch { return {} }
}

function saveSettings(s) {
  try { fs.writeFileSync(settingsPath(), JSON.stringify(s)) } catch {}
}

function getNotesFolder() {
  const s = loadSettings()
  return s.folder || path.join(app.getPath('documents'), 'Cascade Notes')
}

function ensureFolder(folder) {
  try { fs.mkdirSync(folder, { recursive: true }) } catch {}
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 660,
    minHeight: 480,
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
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

// IPC: settings & folder

ipcMain.handle('notes:getFolder', () => getNotesFolder())

ipcMain.handle('notes:chooseFolder', async () => {
  const result = await dialog.showOpenDialog(mainWin, {
    defaultPath: getNotesFolder(),
    properties: ['openDirectory', 'createDirectory'],
  })
  if (result.filePaths[0]) {
    const s = loadSettings()
    s.folder = result.filePaths[0]
    saveSettings(s)
    return result.filePaths[0]
  }
  return null
})

// IPC: notes CRUD

ipcMain.handle('notes:list', () => {
  const folder = getNotesFolder()
  ensureFolder(folder)
  try {
    return fs.readdirSync(folder)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const full = path.join(folder, f)
        const stat = fs.statSync(full)
        const content = fs.readFileSync(full, 'utf8')
        const firstLine = content.split('\n').find(l => l.trim()) || ''
        const title = firstLine.replace(/^#+\s*/, '').trim() || f.replace('.md', '')
        const preview = content.replace(/^#+\s*.+\n?/, '').replace(/[#*`]/g, '').trim().slice(0, 80)
        return {
          id: f,
          name: f,
          title,
          preview,
          mtime: stat.mtime.toISOString(),
          path: full,
        }
      })
      .sort((a, b) => new Date(b.mtime) - new Date(a.mtime))
  } catch { return [] }
})

ipcMain.handle('notes:read', (_, notePath) => {
  try { return fs.readFileSync(notePath, 'utf8') } catch { return '' }
})

ipcMain.handle('notes:write', (_, notePath, content) => {
  try { fs.writeFileSync(notePath, content, 'utf8'); return true } catch { return false }
})

ipcMain.handle('notes:create', (_, title) => {
  const folder = getNotesFolder()
  ensureFolder(folder)
  const safe = (title || 'Untitled').replace(/[\\/:*?"<>|]/g, '-').trim() || 'Untitled'
  let name = safe + '.md'
  let i = 1
  while (fs.existsSync(path.join(folder, name))) { name = `${safe} ${i++}.md` }
  const full = path.join(folder, name)
  const content = `# ${title || 'Untitled'}\n\n`
  fs.writeFileSync(full, content, 'utf8')
  const stat = fs.statSync(full)
  return { id: name, name, title: title || 'Untitled', preview: '', mtime: stat.mtime.toISOString(), path: full }
})

ipcMain.handle('notes:rename', (_, oldPath, newTitle) => {
  const folder = path.dirname(oldPath)
  const safe = newTitle.replace(/[\\/:*?"<>|]/g, '-').trim() || 'Untitled'
  let name = safe + '.md'
  let i = 1
  while (fs.existsSync(path.join(folder, name)) && path.join(folder, name) !== oldPath) {
    name = `${safe} ${i++}.md`
  }
  const newPath = path.join(folder, name)
  try { fs.renameSync(oldPath, newPath); return { name, path: newPath } } catch { return null }
})

ipcMain.handle('notes:delete', (_, notePath) => {
  try { shell.trashItem(notePath); return true } catch { return false }
})

ipcMain.handle('notes:search', (_, query) => {
  const folder = getNotesFolder()
  if (!query) return []
  const q = query.toLowerCase()
  try {
    return fs.readdirSync(folder)
      .filter(f => f.endsWith('.md'))
      .filter(f => {
        const full = path.join(folder, f)
        const content = fs.readFileSync(full, 'utf8').toLowerCase()
        return f.toLowerCase().includes(q) || content.includes(q)
      })
      .map(f => {
        const full = path.join(folder, f)
        const stat = fs.statSync(full)
        const content = fs.readFileSync(full, 'utf8')
        const firstLine = content.split('\n').find(l => l.trim()) || ''
        const title = firstLine.replace(/^#+\s*/, '').trim() || f.replace('.md', '')
        return { id: f, name: f, title, preview: '', mtime: stat.mtime.toISOString(), path: full }
      })
  } catch { return [] }
})

ipcMain.on('window:minimize', () => mainWin?.minimize())
ipcMain.on('window:maximize', () => mainWin?.isMaximized() ? mainWin.unmaximize() : mainWin.maximize())
ipcMain.on('window:close', () => mainWin?.close())
