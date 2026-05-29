import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('browserAPI', {
  platform: process.platform,

  getBookmarks: () => ipcRenderer.invoke('browser:getBookmarks'),
  addBookmark: (bm) => ipcRenderer.invoke('browser:addBookmark', bm),
  updateBookmark: (bm) => ipcRenderer.invoke('browser:updateBookmark', bm),
  removeBookmark: (url) => ipcRenderer.invoke('browser:removeBookmark', url),

  getHistory: () => ipcRenderer.invoke('browser:getHistory'),
  addHistory: (entry) => ipcRenderer.invoke('browser:addHistory', entry),
  clearHistory: () => ipcRenderer.invoke('browser:clearHistory'),

  onDownloadStart: (cb) => {
    ipcRenderer.on('browser:downloadStart', (_, d) => cb(d))
    return () => ipcRenderer.removeAllListeners('browser:downloadStart')
  },
  onDownloadProgress: (cb) => {
    ipcRenderer.on('browser:downloadProgress', (_, d) => cb(d))
    return () => ipcRenderer.removeAllListeners('browser:downloadProgress')
  },
  onDownloadDone: (cb) => {
    ipcRenderer.on('browser:downloadDone', (_, d) => cb(d))
    return () => ipcRenderer.removeAllListeners('browser:downloadDone')
  },

  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  onMaximized: (cb) => {
    ipcRenderer.on('window:maximized', (_, v) => cb(v))
    return () => ipcRenderer.removeAllListeners('window:maximized')
  },
})
