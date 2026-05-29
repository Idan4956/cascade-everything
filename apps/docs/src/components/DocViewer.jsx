import React, { useState } from 'react'

function renderMarkdown(md) {
  if (!md) return ''
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // code blocks
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre style="background:rgba(0,0,0,0.3);padding:12px 16px;border-radius:8px;overflow-x:auto;margin:12px 0;font-size:13px;line-height:1.6;border:1px solid rgba(255,255,255,0.08)">${code.trim()}</pre>`)
  // headers
  html = html.replace(/^#{6}\s(.+)$/gm, '<h6 style="font-size:13px;font-weight:700;margin:16px 0 6px">$1</h6>')
  html = html.replace(/^#{5}\s(.+)$/gm, '<h5 style="font-size:14px;font-weight:700;margin:16px 0 6px">$1</h5>')
  html = html.replace(/^#{4}\s(.+)$/gm, '<h4 style="font-size:15px;font-weight:700;margin:18px 0 6px">$1</h4>')
  html = html.replace(/^#{3}\s(.+)$/gm, '<h3 style="font-size:17px;font-weight:700;margin:20px 0 8px">$1</h3>')
  html = html.replace(/^#{2}\s(.+)$/gm, '<h2 style="font-size:20px;font-weight:700;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08)">$1</h2>')
  html = html.replace(/^#{1}\s(.+)$/gm, '<h1 style="font-size:26px;font-weight:800;margin:28px 0 12px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1)">$1</h1>')
  // blockquotes
  html = html.replace(/^&gt;\s(.+)$/gm, '<blockquote style="border-left:3px solid rgba(59,130,246,0.6);margin:8px 0;padding:6px 14px;color:rgba(232,232,240,0.7);background:rgba(59,130,246,0.06);border-radius:0 6px 6px 0">$1</blockquote>')
  // horizontal rules
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:20px 0"/>')
  // bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#3b82f6;text-decoration:none">$1</a>')
  // unordered lists
  html = html.replace(/^[\-\*]\s(.+)$/gm, '<li style="margin:3px 0">$1</li>')
  html = html.replace(/(<li[^>]*>.*<\/li>(\n|$))+/g, m => `<ul style="padding-left:20px;margin:8px 0">${m}</ul>`)
  // ordered lists
  html = html.replace(/^\d+\.\s(.+)$/gm, '<oli>$1</oli>')
  html = html.replace(/(<oli>.*<\/oli>(\n|$))+/g, m => `<ol style="padding-left:20px;margin:8px 0">${m.replace(/<\/?oli>/g, m2 => m2 === '<oli>' ? '<li style="margin:3px 0">' : '</li>')}</ol>`)
  // paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p style="margin:0 0 12px;line-height:1.7">')
  html = '<p style="margin:0 0 12px;line-height:1.7">' + html + '</p>'
  return html
}

export default function DocViewer({ file, data, loading, error, onOpen }) {
  const [activeSheet, setActiveSheet] = useState(0)

  if (!file) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="7" y1="8" x2="17" y2="8"/>
            <line x1="7" y1="12" x2="17" y2="12"/>
            <line x1="7" y1="16" x2="13" y2="16"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Open a document to get started</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>PDF, DOCX, XLSX, Markdown, and more</div>
        </div>
        <button onClick={onOpen} style={{
          marginTop: 8, padding: '10px 22px', borderRadius: 10,
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}>Open document</button>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <span style={{ color: '#ef4444', fontSize: 14 }}>Failed to open document</span>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{error}</span>
      </div>
    )
  }

  if (!data) return null

  if (data.type === 'pdf') {
    return (
      <iframe
        src={data.url}
        style={{ flex: 1, border: 'none', background: '#fff' }}
        title="PDF Viewer"
      />
    )
  }

  if (data.type === 'html') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px', background: 'var(--bg)' }}>
        <div
          style={{
            maxWidth: 720, margin: '0 auto', color: 'var(--text)',
            fontSize: 15, lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      </div>
    )
  }

  if (data.type === 'spreadsheet') {
    const sheet = data.sheets[activeSheet]
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {data.sheets.length > 1 && (
          <div style={{ display: 'flex', gap: 2, padding: '8px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {data.sheets.map((s, i) => (
              <button key={i} onClick={() => setActiveSheet(i)} style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none',
                background: activeSheet === i ? 'var(--accent-soft)' : 'transparent',
                color: activeSheet === i ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer',
              }}>{s.name}</button>
            ))}
          </div>
        )}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
          <style>{`
            .xlsx-table table { border-collapse: collapse; font-size: 13px; }
            .xlsx-table td, .xlsx-table th { border: 1px solid rgba(255,255,255,0.08); padding: 6px 12px; white-space: nowrap; color: var(--text); }
            .xlsx-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
            .xlsx-table tr:hover td { background: rgba(59,130,246,0.08); }
          `}</style>
          <div className="xlsx-table" style={{ padding: 16 }} dangerouslySetInnerHTML={{ __html: sheet.html }} />
        </div>
      </div>
    )
  }

  if (data.type === 'markdown') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 48px', background: 'var(--bg)' }}>
        <div
          style={{ maxWidth: 720, margin: '0 auto', color: 'var(--text)', fontSize: 15, userSelect: 'text' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.content) }}
        />
      </div>
    )
  }

  // Plain text / JSON / etc.
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg)' }}>
      <pre style={{
        color: 'var(--text)', fontSize: 13, lineHeight: 1.7,
        fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', userSelect: 'text',
      }}>{data.content}</pre>
    </div>
  )
}
