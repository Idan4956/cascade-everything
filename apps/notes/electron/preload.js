import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('notesAPI', {
  platform: process.platform,
  getFolder: () => ipcRenderer.invoke('notes:getFolder'),
  chooseFolder: () => ipcRenderer.invoke('notes:chooseFolder'),
  list: () => ipcRenderer.invoke('notes:list'),
  read: (notePath) => ipcRenderer.invoke('notes:read', notePath),
  write: (notePath, content) => ipcRenderer.invoke('notes:write', notePath, content),
  create: (title) => ipcRenderer.invoke('notes:create', title),
  rename: (oldPath, newTitle) => ipcRenderer.invoke('notes:rename', oldPath, newTitle),
  delete: (notePath) => ipcRenderer.invoke('notes:delete', notePath),
  search: (query) => ipcRenderer.invoke('notes:search', query),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  onMaximized: (cb) => {
    ipcRenderer.on('window:maximized', (_, v) => cb(v))
    return () => ipcRenderer.removeAllListeners('window:maximized')
  },
})
