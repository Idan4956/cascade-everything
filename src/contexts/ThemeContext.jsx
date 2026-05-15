import React from 'react'

export const LIGHT = {
  bg: '#ece8f5',
  appBg: 'linear-gradient(145deg, #ece8f5 0%, #e7e1f4 45%, #edeaf8 100%)',
  glassBg: 'rgba(255,255,255,0.62)',
  glassPreviewBg: 'rgba(255,255,255,0.74)',
  glassSidebarBg: 'rgba(255,255,255,0.52)',
  glassHeaderBg: 'rgba(255,255,255,0.68)',
  glassStatusBg: 'rgba(255,255,255,0.52)',
  glassBorder: 'rgba(255,255,255,0.88)',
  glassBlur: 'blur(28px) saturate(120%)',
  columnBg: 'rgba(255,255,255,0.62)',
  sidebarBg: 'rgba(255,255,255,0.52)',
  headerBg: 'rgba(255,255,255,0.68)',
  statusBg: 'rgba(255,255,255,0.52)',
  previewBg: 'rgba(255,255,255,0.74)',
  qfBg: 'rgba(236,232,245,0.97)',
  modalBg: 'rgba(255,255,255,0.96)',
  inputBg: 'rgba(255,255,255,0.72)',
  inputBorder: 'rgba(0,0,0,0.09)',
  text: 'rgba(0,0,0,0.88)',
  textMid: 'rgba(0,0,0,0.60)',
  textSub: 'rgba(0,0,0,0.44)',
  textDim: 'rgba(0,0,0,0.32)',
  textFaint: 'rgba(0,0,0,0.20)',
  border: 'rgba(0,0,0,0.055)',
  borderMid: 'rgba(0,0,0,0.09)',
  hoverBg: 'rgba(0,0,0,0.04)',
  selBg: 'rgba(0,0,0,0.055)',
  codeBg: '#f2eefa',
  dark: false,
}

export const DARK = {
  bg: '#0d0b18',
  appBg: 'linear-gradient(145deg, #0d0b18 0%, #11102a 55%, #0f0d20 100%)',
  glassBg: 'rgba(255,255,255,0.048)',
  glassPreviewBg: 'rgba(255,255,255,0.062)',
  glassSidebarBg: 'rgba(255,255,255,0.032)',
  glassHeaderBg: 'rgba(255,255,255,0.040)',
  glassStatusBg: 'rgba(255,255,255,0.032)',
  glassBorder: 'rgba(255,255,255,0.075)',
  glassBlur: 'blur(28px) saturate(145%)',
  columnBg: 'rgba(255,255,255,0.048)',
  sidebarBg: 'rgba(255,255,255,0.032)',
  headerBg: 'rgba(255,255,255,0.040)',
  statusBg: 'rgba(255,255,255,0.032)',
  previewBg: 'rgba(255,255,255,0.062)',
  qfBg: 'rgba(13,11,24,0.96)',
  modalBg: 'rgba(18,15,36,0.96)',
  inputBg: 'rgba(255,255,255,0.065)',
  inputBorder: 'rgba(255,255,255,0.082)',
  text: 'rgba(255,255,255,0.93)',
  textMid: 'rgba(255,255,255,0.68)',
  textSub: 'rgba(255,255,255,0.48)',
  textDim: 'rgba(255,255,255,0.33)',
  textFaint: 'rgba(255,255,255,0.18)',
  border: 'rgba(255,255,255,0.065)',
  borderMid: 'rgba(255,255,255,0.096)',
  hoverBg: 'rgba(255,255,255,0.058)',
  selBg: 'rgba(255,255,255,0.092)',
  codeBg: '#0e0c1e',
  dark: true,
}

const ThemeCtx = React.createContext({ T: LIGHT, dark: false, toggleDark: () => {} })

export function ThemeProvider({ children }) {
  const [dark, setDark] = React.useState(() => {
    try { return localStorage.getItem('cascade-dark') === '1' } catch { return false }
  })

  const toggleDark = React.useCallback(() => {
    setDark(d => {
      const next = !d
      try { localStorage.setItem('cascade-dark', next ? '1' : '0') } catch {}
      return next
    })
  }, [])

  const value = React.useMemo(() => ({
    T: dark ? DARK : LIGHT,
    dark,
    toggleDark,
  }), [dark, toggleDark])

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  return React.useContext(ThemeCtx)
}
