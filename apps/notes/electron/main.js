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

ipcMain.handle('notes:export', async (_, { content, format, defaultName }) => {
  const filterMap = {
    md:   [{ name: 'Markdown', extensions: ['md'] }],
    txt:  [{ name: 'Text File', extensions: ['txt'] }],
    html: [{ name: 'HTML File', extensions: ['html'] }],
  }
  const result = await dialog.showSaveDialog(mainWin, {
    defaultPath: path.join(app.getPath('documents'), defaultName),
    filters: filterMap[format] || filterMap.md,
  })
  if (result.canceled || !result.filePath) return { ok: false }

  let output = content
  if (format === 'txt') {
    output = content
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`{3}[\w]*\n?[\s\S]*?`{3}/gm, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^- \[[ x]\] /gm, '')
      .replace(/^[-*] /gm, '')
      .replace(/^\d+\. /gm, '')
      .replace(/^> /gm, '')
      .replace(/^---+$/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  } else if (format === 'html') {
    const title = defaultName.replace(/\.md$/, '')
    output = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#1a1a2e;line-height:1.75;font-size:16px}
  h1,h2,h3{font-weight:700;margin:1.5em 0 .5em}h1{font-size:2em;border-bottom:2px solid #eee;padding-bottom:.3em}h2{font-size:1.5em;border-bottom:1px solid #eee;padding-bottom:.25em}
  pre{background:#f6f8fa;padding:14px 18px;border-radius:8px;overflow-x:auto;font-size:.9em}
  code{background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:.9em}
  blockquote{border-left:4px solid #d0d7de;margin:0;padding:6px 16px;color:#57606a;background:#f6f8fa;border-radius:0 6px 6px 0}
  input[type=checkbox]{margin-right:6px}
  a{color:#0969da}hr{border:none;border-top:1px solid #d0d7de;margin:24px 0}
  ul,ol{padding-left:24px}li{margin:4px 0}
</style>
</head>
<body>${content
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/```[\w]*\n?([\s\S]*?)```/g, (_,c)=>`<pre><code>${c.trim()}</code></pre>`)
  .replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
  .replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>')
  .replace(/^---+$/gm,'<hr>')
  .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
  .replace(/`([^`]+)`/g,'<code>$1</code>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>')
  .replace(/^- \[x\] (.+)$/gm,'<li style="list-style:none"><input type="checkbox" checked disabled> $1</li>')
  .replace(/^- \[ \] (.+)$/gm,'<li style="list-style:none"><input type="checkbox" disabled> $1</li>')
  .replace(/^[-*] (.+)$/gm,'<li>$1</li>').replace(/^(\d+)\. (.+)$/gm,'<li>$2</li>')
  .replace(/\n\n/g,'</p><p>').replace(/^(?!<[a-z])(.+)$/gm,'$1')
}</body></html>`
  }

  try { fs.writeFileSync(result.filePath, output, 'utf8'); return { ok: true } }
  catch (e) { return { ok: false, error: e.message } }
})

ipcMain.on('window:minimize', () => mainWin?.minimize())
ipcMain.on('window:maximize', () => mainWin?.isMaximized() ? mainWin.unmaximize() : mainWin.maximize())
ipcMain.on('window:close', () => mainWin?.close())
