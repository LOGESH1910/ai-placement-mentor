import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../services/api'
import Icon from '../components/ui/Icon'
import Markdown from '../utils/markdown'
import { stripMarkdown } from '../utils/mdText'

const STORAGE_KEY = 'apm_ai_conversations'

const SYSTEM_PROMPT =
  'You are an expert AI Placement Mentor helping engineering students prepare for campus placements. ' +
  'Give structured, practical answers: use short headings, bullet lists and code examples where useful. ' +
  'Cover coding interviews, core CS subjects (DBMS, OS, networks), aptitude, HR rounds and resume tips. ' +
  'Keep responses focused and under 400 words unless asked for depth.'

const SUGGESTIONS = [
  'Create a Java interview roadmap',
  'Explain OOP with an example',
  'Give me 10 DSA questions',
  'Conduct a mock technical interview',
  'Review my interview answer: “I work hard and am a team player.”',
  'What should I study today?',
]

const uid = () => Math.random().toString(36).slice(2, 10)

function loadConversations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function newConversation() {
  return { id: uid(), title: 'New chat', messages: [], createdAt: Date.now() }
}

export default function AIMentorPage() {
  const location = useLocation()
  const initialPrompt = location.state?.initialPrompt

  const [conversations, setConversations] = useState(loadConversations)
  const [activeId, setActiveId] = useState(() => conversations[0]?.id ?? null)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [error, setError] = useState('')

  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const active = conversations.find((c) => c.id === activeId) ?? null
  const messages = active?.messages ?? []

  /* Persist conversations */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 30)))
  }, [conversations])

  /* Auto-scroll on new messages */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, thinking])

  const updateActive = useCallback((updater) => {
    setConversations((convs) => {
      if (!activeId) return convs
      return convs.map((c) => (c.id === activeId ? updater(c) : c))
    })
  }, [activeId])

  /* ── Send a message ─────────────────────────────────────────────────── */
  const send = useCallback(async (text, { regenerate = false } = {}) => {
    const prompt = (text ?? '').trim()
    if ((!prompt && !regenerate) || thinking) return
    setError('')
    setThinking(true)

    // Resolve or create the target conversation up front
    let convo = active ?? newConversation()

    // Apply the user's message locally
    let msgs = [...convo.messages]
    if (!regenerate) {
      msgs = [...msgs, { id: uid(), role: 'user', content: prompt }]
    } else if (msgs.at(-1)?.role === 'assistant') {
      msgs = msgs.slice(0, -1)
    }

    const title = convo.title === 'New chat'
      ? (prompt || msgs[0]?.content || 'New chat').slice(0, 42) + ((prompt || msgs[0]?.content || '').length > 42 ? '…' : '')
      : convo.title

    convo = { ...convo, messages: msgs, title }
    setConversations((cs) => {
      const exists = cs.some((c) => c.id === convo.id)
      return exists ? cs.map((c) => (c.id === convo.id ? convo : c)) : [convo, ...cs]
    })
    setActiveId(convo.id)
    setInput('')

    const historyForApi = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...msgs.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    ]

    try {
      const res = await api.post('/interview/chat', { messages: historyForApi })
      const reply = res.data?.reply
      if (!reply) throw new Error('The AI returned an empty response. Please try again.')
      setConversations((cs) => cs.map((c) => {
        if (c.id !== convo.id) return c
        const last = c.messages.at(-1)
        // Guard against duplicate appends (StrictMode double-invocation)
        if (last?.role === 'assistant' && last.content === reply) return c
        return { ...c, messages: [...c.messages, { id: uid(), role: 'assistant', content: reply }] }
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setThinking(false)
      inputRef.current?.focus()
    }
  }, [active, thinking])

  /* Handle dashboard "Ask AI" hand-off */
  useEffect(() => {
    if (initialPrompt) {
      send(initialPrompt)
      // clear router state so refresh doesn't resend
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startNewChat = () => {
    const c = newConversation()
    setConversations((cs) => [c, ...cs])
    setActiveId(c.id)
    setError('')
    inputRef.current?.focus()
  }

  const deleteConversation = (id) => {
    setConversations((cs) => {
      const next = cs.filter((c) => c.id !== id)
      if (id === activeId) setActiveId(next[0]?.id ?? null)
      return next
    })
  }

  const clearActive = () => {
    if (active) updateActive((c) => ({ ...c, messages: [], title: 'New chat' }))
    setError('')
  }

  const copyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(stripMarkdown(content))
    } catch { /* non-fatal */ }
  }

  return (
    <div className="anim-slide-up">
      <div style={{ display: 'grid', gridTemplateColumns: '250px minmax(0,1fr)', gap: '1.25rem', alignItems: 'start' }} className="ai-layout">

        {/* ── Sidebar: conversation history ────────────────────────────── */}
        <aside className="card card-pad flex-col" style={{ gap: '0.75rem', position: 'sticky', top: 'calc(var(--topnav-h) + 16px)', maxHeight: 'calc(100vh - var(--topnav-h) - 32px)' }}>
          <button className="btn btn-primary btn-block btn-sm" onClick={startNewChat}>
            <Icon name="plus" size={14} /> New conversation
          </button>

          <div className="flex-col" style={{ overflowY: 'auto', gap: 2, minHeight: 60 }}>
            {conversations.length === 0 ? (
              <p className="caption" style={{ padding: '0.5rem 0.25rem' }}>
                Your conversations will be saved here.
              </p>
            ) : (
              conversations.map((c) => (
                <div key={c.id} className={`convo-item${c.id === activeId ? ' active' : ''}`} style={{ paddingRight: 4 }}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    style={{ flex: 1, minWidth: 0, textAlign: 'left', fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}
                    title={c.title}
                  >
                    <span className="row" style={{ gap: 7 }}>
                      <Icon name="sparkles" size={13} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                    </span>
                  </button>
                  <button onClick={() => deleteConversation(c.id)} className="icon-btn" style={{ width: 26, height: 26 }}
                    aria-label={`Delete conversation: ${c.title}`}>
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="divider" />
          <p className="caption" style={{ lineHeight: 1.6 }}>
            AI Mentor helps with roadmaps, concept explanations, mock interviews and answer reviews.
          </p>
        </aside>

        {/* ── Main chat panel ──────────────────────────────────────────── */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topnav-h) - 48px)', minHeight: 480 }}>
          {/* Header */}
          <div className="card-header">
            <div className="row">
              <span className="tile-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)', width: 34, height: 34 }}>
                <Icon name="sparkles" size={16} />
              </span>
              <div>
                <h2 style={{ fontSize: '0.92rem', fontWeight: 700 }}>AI Placement Mentor</h2>
                <span className="caption row" style={{ gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--success)', display: 'inline-block' }} />
                  Online — answers instantly
                </span>
              </div>
            </div>
            {messages.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearActive}>
                <Icon name="refresh" size={13} /> Clear conversation
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', background: 'var(--bg-inset)' }} aria-live="polite">
            {messages.length === 0 && !thinking ? (
              <div className="empty-state" style={{ height: '100%', justifyContent: 'center' }}>
                <span className="empty-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)', borderColor: 'transparent' }}>
                  <Icon name="sparkles" size={24} />
                </span>
                <p className="empty-title">Ask your AI Placement Mentor</p>
                <p className="empty-desc">Get a study plan, explain a concept, practise an answer or simulate an interview.</p>
                <div className="chip-row" style={{ justifyContent: 'center', maxWidth: 560, marginTop: 8 }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-col" style={{ gap: '1rem' }}>
                {messages.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div className="chat-bubble-user">{m.content}</div>
                    </div>
                  ) : (
                    <div key={m.id} className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                      <span className="avatar" aria-hidden="true"><Icon name="sparkles" size={13} /></span>
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="chat-bubble-ai">
                          <Markdown text={m.content} />
                        </div>
                        <div className="row" style={{ gap: 4 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => copyMessage(m.content)} aria-label="Copy response">
                            <Icon name="copy" size={12} /> Copy
                          </button>
                          {m.id === messages.filter((x) => x.role === 'assistant').at(-1)?.id && !thinking && (
                            <button className="btn btn-ghost btn-sm" onClick={() => send(null, { regenerate: true })} disabled={thinking}>
                              <Icon name="refresh" size={12} /> Regenerate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {thinking && (
                  <div className="row" style={{ gap: 10 }}>
                    <span className="avatar" aria-hidden="true"><Icon name="sparkles" size={13} /></span>
                    <div className="chat-bubble-ai row" style={{ gap: 5, width: 'fit-content' }} role="status" aria-label="AI is thinking">
                      <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="alert alert-error" role="alert" style={{ margin: '0 1.25rem' }}>
              <Icon name="alert" size={15} />
              <span style={{ flex: 1 }}>{error}</span>
              <button className="alert-dismiss" onClick={() => setError('')} aria-label="Dismiss error">✕</button>
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input) }}
            style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.6rem' }}
          >
            <input
              ref={inputRef}
              className="form-input"
              placeholder="Ask about DSA, Java, aptitude strategy, HR answers…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Message the AI mentor"
              maxLength={2000}
            />
            <button type="submit" className="btn btn-primary btn-icon" disabled={!input.trim() || thinking}
              aria-label="Send message" title="Send">
              <Icon name="send" size={16} />
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
