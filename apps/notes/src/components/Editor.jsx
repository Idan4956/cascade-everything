import React, { useState, useCallback } from 'react'

function renderMarkdown(md) {
  if (!md) return ''
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // fenced code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/gm, (_, code) =>
    `<pre style="background:rgba(0,0,0,0.35);padding:12px 16px;border-radius:8px;overflow-x:auto;margin:12px 0;font-size:13px;line-height:1.6;border:1px solid rgba(255,255,255,0.07);font-family:monospace">${code.trim()}</pre>`)
  // headings
  html = html
    .replace(/^### (.+)$/gm, '<h3 style="font-size:17px;font-weight:700;margin:20px 0 8px;color:#e8e8f0">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:21px;font-weight:700;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);color:#fff">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:28px;font-weight:800;margin:28px 0 14px;color:#fff">$1</h1>')
  // blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid rgba(16,185,129,0.6);margin:8px 0;padding:6px 14px;color:rgba(232,232,240,0.7);background:rgba(16,185,129,0.06);border-radius:0 6px 6px 0">$1</blockquote>')
  // hr
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0"/>')
  // bold+italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.88em">$1</code>')
  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#10b981;text-decoration:none">$1</a>')
  // unordered list
  html = html.replace(/^[-*] (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
  html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:22px;margin:8px 0">${m}</ul>`)
  // ordered list
  html = html.replace(/^\d+\. (.+)$/gm, '<_li>$1</_li>')
  html = html.replace(/(<_li>.*?<\/_li>\n?)+/g, m =>
    `<ol style="padding-left:22px;margin:8px 0">${m.replace(/<\/?_li>/g, t => t === '<_li>' ? '<li style="margin:3px 0">' : '</li>')}</ol>`)
  // paragraphs
  const lines = html.split('\n')
  const result = []
  let inBlock = false
  for (const line of lines) {
    if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<ol') || line.startsWith('<pre') || line.startsWith('<blockquote') || line.startsWith('<hr')) {
      if (inBlock) { result.push('</p>'); inBlock = false }
      result.push(line)
    } else if (line.trim() === '') {
      if (inBlock) { result.push('</p>'); inBlock = false }
    } else {
      if (!inBlock) { result.push('<p style="margin:0 0 10px;line-height:1.75">'); inBlock = true }
      result.push(line)
    }
  }
  if (inBlock) result.push('</p>')
  return result.join('\n')
}

const MODES = ['edit', 'split', 'preview']

export default function Editor({ content, onChange, active }) {
  const [mode, setMode] = useState('split')

  if (!active) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)' }}>Select a note or create one</span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        height: 36, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 4,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 6 }}>View:</span>
        {[['edit','Edit'],['split','Split'],['preview','Preview']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '3px 10px', borderRadius: 5, fontSize: 11.5, fontWeight: 600, border: 'none',
            background: mode === m ? 'var(--accent-soft)' : 'transparent',
            color: mode === m ? 'var(--accent)' : 'var(--muted)',
            cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            value={content}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              background: 'var(--bg)', color: 'var(--text)',
              fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
              fontSize: 14, lineHeight: 1.75, padding: '24px 28px',
              borderRight: mode === 'split' ? '1px solid var(--border)' : 'none',
              userSelect: 'text',
            }}
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div style={{
            flex: 1, overflowY: 'auto', padding: '24px 32px',
            background: 'var(--bg)', userSelect: 'text',
          }}>
            <div
              style={{ maxWidth: 660, color: 'var(--text)', fontSize: 15 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
