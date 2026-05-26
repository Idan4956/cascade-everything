export function basename(filePath) {
  return filePath.replace(/\\/g, '/').split('/').pop() || filePath
}

export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}
