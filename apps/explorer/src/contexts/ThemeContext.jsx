import React from 'react'

export const LIGHT = {
  bg: '#e8e4f5',
  appBg: 'linear-gradient(150deg, #e4dff5 0%, #ddd6f3 40%, #e8e3f8 100%)',
  glassBg: 'rgba(255,255,255,0.72)',
  glassPreviewBg: 'rgba(255,255,255,0.80)',
  glassSidebarBg: 'rgba(255,255,255,0.65)',
  glassHeaderBg: 'rgba(255,255,255,0.78)',
  glassStatusBg: 'rgba(255,255,255,0.65)',
  glassBorder: 'rgba(255,255,255,0.90)',
  glassBorderOuter: 'rgba(200,190,230,0.45)',
  glassBlur: 'blur(44px) saturate(130%)',
  columnBg: 'rgba(255,255,255,0.72)',
  sidebarBg: 'rgba(255,255,255,0.65)',
  headerBg: 'rgba(255,255,255,0.78)',
  statusBg: 'rgba(255,255,255,0.65)',
  previewBg: 'rgba(255,255,255,0.80)',
  qfBg: 'rgba(232,228,245,0.97)',
  modalBg: 'rgba(255,255,255,0.96)',
  inputBg: 'rgba(255,255,255,0.80)',
  inputBorder: 'rgba(0,0,0,0.09)',
  text: 'rgba(0,0,0,0.88)',
  textMid: 'rgba(0,0,0,0.60)',
  textSub: 'rgba(0,0,0,0.44)',
  textDim: 'rgba(0,0,0,0.30)',
  textFaint: 'rgba(0,0,0,0.18)',
  border: 'rgba(0,0,0,0.055)',
  borderMid: 'rgba(0,0,0,0.09)',
  hoverBg: 'rgba(0,0,0,0.042)',
  selBg: 'rgba(0,0,0,0.055)',
  codeBg: '#f0ecfa',
  dark: false,
}

export const DARK = {
  bg: '#07050f',
  appBg: 'linear-gradient(150deg, #07050f 0%, #0d0a24 55%, #08061a 100%)',
  // Dark frosted glass: tinted dark-purple surface, clearly visible as a panel
  glassBg: 'rgba(28,22,55,0.68)',
  glassPreviewBg: 'rgba(28,22,55,0.74)',
  glassSidebarBg: 'rgba(22,17,44,0.62)',
  glassHeaderBg: 'rgba(20,15,40,0.80)',
  glassStatusBg: 'rgba(20,15,40,0.70)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassBorderOuter: 'rgba(255,255,255,0.06)',
  glassBlur: 'blur(44px) saturate(180%)',
  columnBg: 'rgba(28,22,55,0.68)',
  sidebarBg: 'rgba(22,17,44,0.62)',
  headerBg: 'rgba(20,15,40,0.80)',
  statusBg: 'rgba(20,15,40,0.70)',
  previewBg: 'rgba(28,22,55,0.74)',
  qfBg: 'rgba(10,8,22,0.96)',
  modalBg: 'rgba(18,14,38,0.97)',
  inputBg: 'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.09)',
  text: 'rgba(255,255,255,0.94)',
  textMid: 'rgba(255,255,255,0.70)',
  textSub: 'rgba(255,255,255,0.50)',
  textDim: 'rgba(255,255,255,0.34)',
  textFaint: 'rgba(255,255,255,0.18)',
  border: 'rgba(255,255,255,0.07)',
  borderMid: 'rgba(255,255,255,0.10)',
  hoverBg: 'rgba(255,255,255,0.07)',
  selBg: 'rgba(255,255,255,0.10)',
  codeBg: '#0c0a1e',
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
