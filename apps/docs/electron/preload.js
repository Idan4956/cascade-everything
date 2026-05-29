import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('docsAPI', {
  platform: process.platform,
  openDialog: () => ipcRenderer.invoke('docs:openDialog'),
  readFile: (filePath) => ipcRenderer.invoke('docs:readFile', filePath),
  getRecent: () => ipcRenderer.invoke('docs:getRecent'),
  addRecent: (filePath) => ipcRenderer.invoke('docs:addRecent', filePath),
  removeRecent: (filePath) => ipcRenderer.invoke('docs:removeRecent', filePath),
  showInFolder: (filePath) => ipcRenderer.invoke('docs:showInFolder', filePath),
  openExternal: (filePath) => ipcRenderer.invoke('docs:openExternal', filePath),
  stat: (filePath) => ipcRenderer.invoke('docs:stat', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('docs:writeFile', filePath, content),
  onOpenPath: (cb) => {
    ipcRenderer.on('docs:openPath', (_, p) => cb(p))
    return () => ipcRenderer.removeAllListeners('docs:openPath')
  },
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  onMaximized: (cb) => {
    ipcRenderer.on('window:maximized', (_, v) => cb(v))
    return () => ipcRenderer.removeAllListeners('window:maximized')
  },
})
