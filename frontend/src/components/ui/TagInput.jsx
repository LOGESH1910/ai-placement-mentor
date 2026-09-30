import { useState } from 'react'

/**
 * Comma/Enter-separated tag input.
 * value: string[], onChange: (string[]) => void
 */
export default function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  const remove = (tag) => onChange(value.filter(t => t !== tag))

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    } else if (e.key === 'Backspace' && !input && value.length) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card2)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.4rem 0.65rem',
      display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center',
      cursor: 'text',
    }}
    onClick={() => document.getElementById('tag-input-field')?.focus()}
    >
      {value.map(tag => (
        <span key={tag} className="tag">
          {tag}
          <span className="tag-remove" onClick={() => remove(tag)} role="button" aria-label={`Remove ${tag}`}>✕</span>
        </span>
      ))}
      <input
        id="tag-input-field"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text)',
          fontSize: '0.9rem',
          flex: 1,
          minWidth: '120px',
        }}
      />
    </div>
  )
}
