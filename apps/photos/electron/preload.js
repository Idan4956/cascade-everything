import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('photosAPI', {
  openDialog: (startPath) => ipcRenderer.invoke('photos:openDialog', startPath),
  listDir: (dirPath) => ipcRenderer.invoke('photos:listDir', dirPath),
  parentDir: (dirPath) => ipcRenderer.invoke('photos:parentDir', dirPath),
  openExternal: (filePath) => ipcRenderer.invoke('photos:openExternal', filePath),
  onOpenPath: (cb) => {
    ipcRenderer.on('open-path', (_, p) => cb(p))
    return () => ipcRenderer.removeAllListeners('open-path')
  },
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  onMaximized: (cb) => {
    ipcRenderer.on('window:maximized', (_, v) => cb(v))
    return () => ipcRenderer.removeAllListeners('window:maximized')
  },
})
