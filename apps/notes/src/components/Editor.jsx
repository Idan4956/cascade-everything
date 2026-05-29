import React, { useState, useCallback, useRef } from 'react'

// ── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(md) {
  if (!md) return ''
  let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/gm, (_, code) =>
    `<pre style="background:rgba(0,0,0,0.35);padding:12px 16px;border-radius:8px;overflow-x:auto;margin:12px 0;font-size:13px;line-height:1.6;border:1px solid rgba(255,255,255,0.07);font-family:monospace">${code.trim()}</pre>`)
  html = html
    .replace(/^### (.+)$/gm, '<h3 style="font-size:17px;font-weight:700;margin:20px 0 8px;color:#e8e8f0">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:21px;font-weight:700;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08);color:#fff">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:28px;font-weight:800;margin:28px 0 14px;color:#fff">$1</h1>')
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:3px solid rgba(16,185,129,0.6);margin:8px 0;padding:6px 14px;color:rgba(232,232,240,0.7);background:rgba(16,185,129,0.06);border-radius:0 6px 6px 0">$1</blockquote>')
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0"/>')
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.88em">$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#10b981;text-decoration:none">$1</a>')
  // Checkboxes before general list items
  html = html.replace(/^- \[x\] (.+)$/gm, '<li style="list-style:none;margin:4px 0;display:flex;align-items:flex-start;gap:7px"><input type="checkbox" checked disabled style="margin-top:3px;accent-color:#10b981;flex-shrink:0"> <span style="text-decoration:line-through;opacity:0.6">$1</span></li>')
  html = html.replace(/^- \[ \] (.+)$/gm, '<li style="list-style:none;margin:4px 0;display:flex;align-items:flex-start;gap:7px"><input type="checkbox" disabled style="margin-top:3px;accent-color:#10b981;flex-shrink:0"> <span>$1</span></li>')
  html = html.replace(/^[-*] (.+)$/gm, '<li style="margin:3px 0;padding-left:4px">$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<_oli>$1</_oli>')
  html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, m => `<ul style="padding-left:22px;margin:8px 0">${m}</ul>`)
  html = html.replace(/(<_oli>.*?<\/_oli>\n?)+/g, m =>
    `<ol style="padding-left:22px;margin:8px 0">${m.replace(/<\/?_oli>/g, t => t === '<_oli>' ? '<li style="margin:3px 0">' : '</li>')}</ol>`)
  const lines = html.split('\n')
  const out = []; let inP = false
  for (const line of lines) {
    if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|li)/.test(line)) {
      if (inP) { out.push('</p>'); inP = false }
      out.push(line)
    } else if (line.trim() === '') {
      if (inP) { out.push('</p>'); inP = false }
    } else {
      if (!inP) { out.push('<p style="margin:0 0 10px;line-height:1.75">'); inP = true }
      out.push(line)
    }
  }
  if (inP) out.push('</p>')
  return out.join('\n')
}

// ── Format helper ────────────────────────────────────────────────────────────

function applyFormat(textarea, type, content) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.slice(start, end)
  const before = content.slice(0, start)
  const after = content.slice(end)
  const lineStart = before.lastIndexOf('\n') + 1
  const lineEndRaw = content.indexOf('\n', end)
  const lineEnd = lineEndRaw === -1 ? content.length : lineEndRaw
  const line = content.slice(lineStart, lineEnd)

  switch (type) {
    case 'bold': {
      const text = selected || 'bold text'
      return { content: before + `**${text}**` + after, sel: [start + 2, start + 2 + text.length] }
    }
    case 'italic': {
      const text = selected || 'italic text'
      return { content: before + `*${text}*` + after, sel: [start + 1, start + 1 + text.length] }
    }
    case 'h1': case 'h2': case 'h3': {
      const h = type === 'h1' ? '# ' : type === 'h2' ? '## ' : '### '
      const clean = line.replace(/^#+\s/, '')
      const newLine = h + clean
      return {
        content: content.slice(0, lineStart) + newLine + content.slice(lineEnd),
        sel: [lineStart + newLine.length, lineStart + newLine.length],
      }
    }
    case 'bullet': {
      const clean = line.replace(/^([-*]|\d+\.)\s/, '').replace(/^- \[[ x]\] /, '')
      const newLine = `- ${clean}`
      return {
        content: content.slice(0, lineStart) + newLine + content.slice(lineEnd),
        sel: [lineStart + newLine.length, lineStart + newLine.length],
      }
    }
    case 'ordered': {
      const clean = line.replace(/^([-*]|\d+\.)\s/, '').replace(/^- \[[ x]\] /, '')
      const newLine = `1. ${clean}`
      return {
        content: content.slice(0, lineStart) + newLine + content.slice(lineEnd),
        sel: [lineStart + newLine.length, lineStart + newLine.length],
      }
    }
    case 'checkbox': {
      const clean = line.replace(/^([-*]|\d+\.)\s/, '').replace(/^- \[[ x]\] /, '')
      const newLine = `- [ ] ${clean}`
      return {
        content: content.slice(0, lineStart) + newLine + content.slice(lineEnd),
        sel: [lineStart + newLine.length, lineStart + newLine.length],
      }
    }
    case 'quote': {
      const newLine = line.startsWith('> ') ? line.slice(2) : `> ${line}`
      return {
        content: content.slice(0, lineStart) + newLine + content.slice(lineEnd),
        sel: [lineStart + newLine.length, lineStart + newLine.length],
      }
    }
    case 'code': {
      const text = selected || ''
      return { content: before + '`' + text + '`' + after, sel: [start + 1, start + 1 + text.length] }
    }
    case 'codeblock': {
      const ins = `\`\`\`\n${selected}\n\`\`\``
      return { content: before + ins + after, sel: [start + 4, start + 4 + selected.length] }
    }
    case 'hr': {
      const ins = `\n\n---\n\n`
      return { content: before + ins + after, sel: [start + ins.length, start + ins.length] }
    }
    case 'link': {
      const text = selected || 'link text'
      const ins = `[${text}](url)`
      return { content: before + ins + after, sel: [start + text.length + 3, start + ins.length - 1] }
    }
    default:
      return { content, sel: [start, end] }
  }
}

// ── Export dropdown ──────────────────────────────────────────────────────────

function ExportMenu({ noteTitle, content }) {
  const [open, setOpen] = useState(false)

  const doExport = async (format) => {
    setOpen(false)
    const base = (noteTitle || 'note').replace(/[\\/:*?"<>|]/g, '-')
    const ext = format === 'html' ? 'html' : format === 'txt' ? 'txt' : 'md'
    await window.notesAPI.export({ content, format, defaultName: `${base}.${ext}` })
  }

  return (
    <div style={{ position: 'relative' }}>
      <FmtBtn title="Export" onClick={() => setOpen(v => !v)} active={open}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
        </svg>
        <span style={{ fontSize: 11.5 }}>Export</span>
      </FmtBtn>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 100,
            background: 'rgba(22,22,29,0.98)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 10, padding: 6, minWidth: 160,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {[['md','Markdown (.md)'],['txt','Plain Text (.txt)'],['html','HTML (.html)']].map(([fmt, label]) => (
              <button key={fmt} onClick={() => doExport(fmt)} style={{
                display: 'block', width: '100%', padding: '7px 12px', background: 'transparent',
                border: 'none', color: 'var(--text)', fontSize: 12.5, cursor: 'pointer',
                borderRadius: 6, textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >{label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Editor({ content, onChange, active, noteTitle }) {
  const [mode, setMode] = useState('split')
  const textareaRef = useRef(null)

  const handleFormat = useCallback((type) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { content: newContent, sel } = applyFormat(textarea, type, content)
    onChange(newContent)
    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.selectionStart = sel[0]
      textareaRef.current.selectionEnd = sel[1]
    })
  }, [content, onChange])

  if (!active) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.15)' }}>Select a note or create one</span>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Formatting toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 1, padding: '4px 10px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <FmtBtn title="Bold" onClick={() => handleFormat('bold')} mono bold>B</FmtBtn>
        <FmtBtn title="Italic" onClick={() => handleFormat('italic')} mono italic>I</FmtBtn>
        <Sep />
        <FmtBtn title="Heading 1" onClick={() => handleFormat('h1')} mono>H1</FmtBtn>
        <FmtBtn title="Heading 2" onClick={() => handleFormat('h2')} mono>H2</FmtBtn>
        <FmtBtn title="Heading 3" onClick={() => handleFormat('h3')} mono>H3</FmtBtn>
        <Sep />
        <FmtBtn title="Bullet list" onClick={() => handleFormat('bullet')}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.5h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 4h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 4h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1M2 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 4a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 4a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/></svg>
        </FmtBtn>
        <FmtBtn title="Numbered list" onClick={() => handleFormat('ordered')}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/><path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"/></svg>
        </FmtBtn>
        <FmtBtn title="Checkbox" onClick={() => handleFormat('checkbox')}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/><path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>
        </FmtBtn>
        <Sep />
        <FmtBtn title="Blockquote" onClick={() => handleFormat('quote')}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388q0-.527.062-1.054.093-.558.31-.992t.559-.683q.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 9 7.558V11a1 1 0 0 0 1 1zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612q0-.527.062-1.054.094-.558.31-.992.217-.434.559-.683.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 3 7.558V11a1 1 0 0 0 1 1z"/></svg>
        </FmtBtn>
        <FmtBtn title="Inline code" onClick={() => handleFormat('code')}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8z"/></svg>
        </FmtBtn>
        <FmtBtn title="Code block" onClick={() => handleFormat('codeblock')} mono small>```</FmtBtn>
        <FmtBtn title="Horizontal rule" onClick={() => handleFormat('hr')} mono>—</FmtBtn>
        <FmtBtn title="Link" onClick={() => handleFormat('link')}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/></svg>
        </FmtBtn>
        <div style={{ flex: 1 }} />
        <ExportMenu noteTitle={noteTitle} content={content} />
      </div>

      {/* Mode toggle */}
      <div style={{
        height: 32, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 3,
        background: 'rgba(15,15,19,0.6)', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        {[['edit','Edit'],['split','Split'],['preview','Preview']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '2px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600, border: 'none',
            background: mode === m ? 'var(--accent-soft)' : 'transparent',
            color: mode === m ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {/* Panes */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              background: 'var(--bg)', color: 'var(--text)',
              fontFamily: "'Cascadia Code','Fira Code',Consolas,monospace",
              fontSize: 14, lineHeight: 1.75, padding: '24px 28px',
              borderRight: mode === 'split' ? '1px solid var(--border)' : 'none',
              userSelect: 'text',
            }}
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'var(--bg)', userSelect: 'text' }}>
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

function FmtBtn({ onClick, title, children, mono, bold, italic, active, small }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: active || hov ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: 'none', color: hov ? '#fff' : 'rgba(255,255,255,0.6)',
        cursor: 'pointer', padding: '4px 6px', borderRadius: 5,
        display: 'flex', alignItems: 'center', gap: 3,
        fontFamily: mono ? 'monospace' : 'inherit',
        fontSize: small ? 11 : mono ? 12 : 13,
        fontWeight: bold ? 800 : 400,
        fontStyle: italic ? 'italic' : 'normal',
        transition: 'background 0.1s, color 0.1s',
        userSelect: 'none', flexShrink: 0,
      }}
    >{children}</button>
  )
}

function Sep() {
  return <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 3px', flexShrink: 0 }} />
}
