import Icon from '../components/ui/Icon'
import { useMemo, useState } from 'react'

/* ── Code block with copy button ─────────────────────────────────────────── */
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard unavailable — fallback below */
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{lang || 'code'}</span>
        <button className="copy-btn" onClick={copy} aria-label="Copy code">
          <Icon name={copied ? 'check' : 'copy'} size={12} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

/* ── Inline formatting: **bold**, `code`, [text](url) ───────────────────── */
function renderInline(text) {
  const nodes = []
  // Order matters: links → code → bold
  const regex = /(\[[^\]]+\]\((https?:\/\/[^\s)]+)\))|(`[^`]+`)|(\*\*[^*]+\*\*)/g
  let last = 0
  let m
  let key = 0
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index))
    if (m[1]) {
      nodes.push(
        <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
          {m[1].slice(1, m[1].indexOf(']'))}
        </a>
      )
    } else if (m[3]) {
      nodes.push(<code key={key++}>{m[3].slice(1, -1)}</code>)
    } else if (m[4]) {
      nodes.push(<strong key={key++}>{m[4].slice(2, -2)}</strong>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/* ── Lightweight markdown renderer (no external dependency) ─────────────── */
export default function Markdown({ text }) {
  const blocks = useMemo(() => parseBlocks(text ?? ''), [text])
  return <div className="chat-md">{blocks}</div>
}

function parseBlocks(src) {
  const out = []
  const lines = src.split('\n')
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block ```lang ... ```
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const buf = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        buf.push(lines[i])
        i++
      }
      i++ // closing fence
      out.push(<CodeBlock key={key++} lang={lang} code={buf.join('\n')} />)
      continue
    }

    // Heading ### / ##
    const h = line.match(/^(#{2,4})\s+(.*)/)
    if (h) {
      out.push(<h3 key={key++}>{renderInline(h[2])}</h3>)
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const buf = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2))
        i++
      }
      out.push(<blockquote key={key++}>{renderInline(buf.join(' '))}</blockquote>)
      continue
    }

    // Unordered list
    if (/^\s*[-*•]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, ''))
        i++
      }
      out.push(
        <ul key={key++}>
          {items.map((it, n) => <li key={n}>{renderInline(it)}</li>)}
        </ul>
      )
      continue
    }

    // Ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''))
        i++
      }
      out.push(
        <ol key={key++}>
          {items.map((it, n) => <li key={n}>{renderInline(it)}</li>)}
        </ol>
      )
      continue
    }

    // Blank line = paragraph break
    if (!line.trim()) {
      i++
      continue
    }

    // Paragraph — gather until blank line or special block
    const para = []
    while (
      i < lines.length && lines[i].trim() &&
      !lines[i].trimStart().startsWith('```') &&
      !/^(#{2,4})\s/.test(lines[i]) &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !lines[i].startsWith('> ')
    ) {
      para.push(lines[i])
      i++
    }
    out.push(<p key={key++}>{renderInline(para.join('\n').replace(/\n/g, ' '))}</p>)
  }

  return out
}
