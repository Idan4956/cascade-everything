export const theme = {
  bg: '#0f0f13',
  surface: '#16161d',
  border: 'rgba(255,255,255,0.06)',
  text: '#e8e8f0',
  muted: '#888899',
  accent: '#8b5cf6',
  accentSoft: 'rgba(139,92,246,0.14)',
  accentGlow: 'rgba(139,92,246,0.35)',
}

export const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: ${theme.bg};
    --surface: ${theme.surface};
    --border: ${theme.border};
    --text: ${theme.text};
    --muted: ${theme.muted};
    --accent: ${theme.accent};
    --accent-soft: ${theme.accentSoft};
    --accent-glow: ${theme.accentGlow};
  }
  html, body, #root { height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    user-select: none;
    overflow: hidden;
  }
`
