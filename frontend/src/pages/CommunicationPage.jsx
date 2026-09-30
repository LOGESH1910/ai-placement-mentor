import { useState, useRef, useEffect, useCallback } from 'react'
import api from '../services/api'

// ── Scenario prompts ─────────────────────────────────────────────────────────
const SCENARIOS = [
  { id: 'intro',      label: 'Self Introduction',   icon: '👋', color: '#2563eb',   prompt: 'You are an interviewer conducting a 15-20 minute session. Ask the candidate to introduce themselves, then ask follow-up questions about their background, skills, projects and career goals. Provide conversational feedback on their communication style, clarity, and confidence after each response. Keep each response to 2-3 sentences. Start by asking them to introduce themselves.' },
  { id: 'hr',         label: 'HR Round',             icon: '👔', color: '#a78bfa',   prompt: 'You are a friendly HR interviewer conducting a 15-20 minute round. Ask common HR questions one at a time (strengths, weaknesses, why this company, teamwork, conflict resolution, goals, achievements, failures, leadership, time management). Give brief feedback after each answer, then ask the next question. Start with your first HR question.' },
  { id: 'technical',  label: 'Technical Discussion', icon: '💻', color: '#10b981',   prompt: 'You are a senior engineer conducting a 15-20 minute technical interview. Ask technical discussion questions (not coding) about system design, problem-solving approaches, past projects, architecture decisions, debugging strategies, and scalability. Give constructive feedback and follow up with the next question. Start with your first question.' },
  { id: 'group',      label: 'GD Simulation',        icon: '🗣️', color: '#f59e0b',   prompt: 'You are facilitating a 15-20 minute group discussion simulation. Give the candidate a topic, guide them to present their views clearly, ask probing follow-up questions, challenge their points, and give feedback on their communication, structure, and confidence. Start by giving a GD topic.' },
  { id: 'impromptu',  label: 'Impromptu Speaking',   icon: '⚡', color: '#ef4444',   prompt: 'You are a communication coach conducting a 15-20 minute impromptu speaking session. Give the candidate random topics and ask them to speak for 1-2 minutes each. After they respond, evaluate fluency, vocabulary, structure, and confidence in detail. Then give a new topic. Start by giving the first topic.' },
]

// ── Speech synthesis helper ───────────────────────────────────────────────────
function speak(text, onEnd) {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate  = 0.95
  utterance.pitch = 1.0
  // Prefer a clear English voice
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))
    || voices.find(v => v.lang === 'en-US')
    || voices[0]
  if (preferred) utterance.voice = preferred
  if (onEnd) utterance.onend = onEnd
  window.speechSynthesis.speak(utterance)
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, onSpeak }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '0.65rem', alignItems: 'flex-end',
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'rgba(0,212,255,0.15)' : 'rgba(167,139,250,0.15)',
        border: `1.5px solid ${isUser ? 'rgba(0,212,255,0.35)' : 'rgba(167,139,250,0.35)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.9rem',
      }}>
        {isUser ? '🧑' : '🤖'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '72%', padding: '0.85rem 1.1rem',
        background: isUser
          ? 'linear-gradient(135deg, rgba(0,212,255,0.14), rgba(0,212,255,0.06))'
          : 'var(--bg-card)',
        border: `1px solid ${isUser ? 'rgba(0,212,255,0.25)' : 'var(--border)'}`,
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        position: 'relative',
      }}>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
        {!isUser && (
          <button onClick={() => onSpeak(msg.content)} style={{
            position: 'absolute', top: '0.5rem', right: '0.5rem',
            background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: 6, padding: '0.15rem 0.45rem',
            color: '#a78bfa', fontSize: '0.7rem', cursor: 'pointer',
          }} title="Speak aloud">🔊</button>
        )}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'block', marginTop: '0.35rem', textAlign: isUser ? 'left' : 'right' }}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CommunicationPage() {
  const [scenario, setScenario]     = useState(null)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [thinking, setThinking]     = useState(false)
  const [listening, setListening]   = useState(false)
  const [speaking, setSpeaking]     = useState(false)
  const [autoSpeak, setAutoSpeak]   = useState(true)
  const [sessionEnd, setSessionEnd] = useState(false)
  const [turnCount, setTurnCount]   = useState(0)

  const bottomRef    = useRef(null)
  const recognizerRef = useRef(null)

  // Scroll to bottom on new message
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  // Load voices (Chrome lazy-loads them)
  useEffect(() => { window.speechSynthesis.getVoices() }, [])

  // Cleanup speech on unmount
  useEffect(() => () => { window.speechSynthesis.cancel(); recognizerRef.current?.abort() }, [])

  // ── Call AI via backend ────────────────────────────────────────────────────
  const callAI = useCallback(async (history) => {
    setThinking(true)
    try {
      const res = await api.post('/interview/chat', { messages: history })
      const data = res.data
      const reply = data.reply || data.message || data.content || 'I could not generate a response.'
      return reply
    } catch (err) {
      console.error('AI error:', err)
      // Fallback: generate a canned response based on scenario
      return "That's a great point! Let me follow up — could you elaborate a bit more on that? I'd love to hear a specific example from your experience."
    } finally {
      setThinking(false)
    }
  }, [])

  // ── Start scenario ─────────────────────────────────────────────────────────
  const startScenario = async (s) => {
    setScenario(s)
    setMessages([])
    setSessionEnd(false)
    setTurnCount(0)
    setThinking(true)

    const systemMsg   = { role: 'system',    content: s.prompt }
    const kickoffMsg  = { role: 'user',      content: 'Start the session.' }
    const history     = [systemMsg, kickoffMsg]

    const reply = await callAI(history)
    const aiMsg = { role: 'assistant', content: reply, ts: Date.now() }
    setMessages([aiMsg])
    if (autoSpeak) { setSpeaking(true); speak(reply, () => setSpeaking(false)) }
  }

  // ── Send a message ─────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || thinking) return

    const userMsg = { role: 'user', content: trimmed, ts: Date.now() }
    const nextTurn = turnCount + 1
    setMessages(m => [...m, userMsg])
    setInput('')
    setTurnCount(nextTurn)

    // Build history for AI
    const systemMsg = { role: 'system', content: scenario.prompt }
    const history = [
      systemMsg,
      { role: 'user', content: 'Start the session.' },
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: trimmed },
    ]

    // After 20 exchanges (~10 min), wrap up
    if (nextTurn >= 20) {
      history.push({
        role: 'user',
        content: 'Please give me a final overall assessment of my communication skills in this session, covering: fluency, confidence, clarity, vocabulary, and areas to improve. Be specific and encouraging.',
      })
      setSessionEnd(true)
    }

    const reply = await callAI(history)
    const aiMsg = { role: 'assistant', content: reply, ts: Date.now() }
    setMessages(m => [...m, aiMsg])
    if (autoSpeak) { setSpeaking(true); speak(reply, () => setSpeaking(false)) }
  }

  // ── Voice input ────────────────────────────────────────────────────────────
  const toggleVoice = () => {
    if (listening) {
      recognizerRef.current?.stop()
      setListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Your browser does not support voice input. Please use Chrome.'); return }

    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult  = (e) => { setInput(e.results[0][0].transcript); setListening(false) }
    rec.onerror   = ()  => setListening(false)
    rec.onend     = ()  => setListening(false)

    rec.start()
    recognizerRef.current = rec
    setListening(true)
  }

  // ── Render: scenario picker ────────────────────────────────────────────────
  if (!scenario) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 className="page-title">Communication Practice</h2>
          <p className="page-subtitle">Choose a scenario — AI will speak, you respond by voice or text</p>
        </div>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['🎤 Voice Input', '🔊 AI Speaks', '📊 Live Feedback', '🔄 20 Turn Sessions (~10 min)'].map(f => (
            <span key={f} style={{ fontSize: '0.78rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: 999 }}>{f}</span>
          ))}
        </div>

        {/* Scenario cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => startScenario(s)} style={{
              background: 'var(--bg-card)', border: `1px solid var(--border)`,
              borderRadius: 14, padding: '1.75rem 1.5rem',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: '0.6rem',
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 0 20px ${s.color}25` }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: s.color }}>{s.label}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {s.id === 'intro'     && 'Practice your personal introduction with AI feedback on clarity and confidence.'}
                {s.id === 'hr'        && 'Simulate a full HR round with common behavioral questions and tips.'}
                {s.id === 'technical' && 'Discuss technical concepts and problem-solving with a senior engineer AI.'}
                {s.id === 'group'     && 'Improve your group discussion skills with structured topic practice.'}
                {s.id === 'impromptu' && 'Build fluency by speaking on random topics and getting instant feedback.'}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Start Session →
              </span>
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="card" style={{ borderColor: 'rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.03)' }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>💡 How It Works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              '1. Pick a scenario — AI greets you and starts the session',
              '2. Respond by typing or click 🎤 to use your voice',
              '3. AI gives real-time feedback after each of your answers',
              '4. After 20 exchanges (~10 minutes), you get a comprehensive performance report',
            ].map(t => (
              <p key={t} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t}</p>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Render: chat interface ─────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 7rem)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button onClick={() => { window.speechSynthesis.cancel(); setScenario(null) }} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '0.5rem 1rem', color: 'var(--text-muted)',
          fontSize: '0.85rem', cursor: 'pointer',
        }}>← Back</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
          <span style={{ fontSize: '1.4rem' }}>{scenario.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: scenario.color }}>{scenario.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Turn {turnCount}/20 · {sessionEnd ? '✅ Session complete' : 'In progress'}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: 120, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(turnCount / 20) * 100}%`, background: scenario.color, borderRadius: 999, transition: 'width 0.4s' }} />
        </div>

        {/* Auto-speak toggle */}
        <button onClick={() => setAutoSpeak(v => !v)} style={{
          background: autoSpeak ? `${scenario.color}18` : 'var(--bg-card)',
          border: `1px solid ${autoSpeak ? scenario.color : 'var(--border)'}`,
          borderRadius: 8, padding: '0.4rem 0.75rem',
          color: autoSpeak ? scenario.color : 'var(--text-muted)',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
        }} title="Toggle AI voice">
          {autoSpeak ? '🔊 Voice On' : '🔇 Voice Off'}
        </button>
      </div>

      {/* Chat window */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
        padding: '1.25rem', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 14,
        minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div className="spinner-lg" style={{ margin: '0 auto 1rem', borderTopColor: scenario.color }} />
            <div style={{ fontWeight: 700 }}>Starting your {scenario.label} session…</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Bubble key={i} msg={msg} onSpeak={(t) => { setSpeaking(true); speak(t, () => setSpeaking(false)) }} />
        ))}

        {thinking && (
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-end' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', border: '1.5px solid rgba(167,139,250,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🤖</div>
            <div style={{ padding: '0.85rem 1.1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: scenario.color, opacity: 0.7, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {speaking && !thinking && (
          <div style={{ textAlign: 'center', fontSize: '0.75rem', color: scenario.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <span style={{ animation: 'pulse 1s infinite' }}>🔊</span> AI is speaking…
            <button onClick={() => { window.speechSynthesis.cancel(); setSpeaking(false) }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '0.1rem 0.4rem', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', marginLeft: 4 }}>Stop</button>
          </div>
        )}

        {sessionEnd && !thinking && (
          <div style={{ textAlign: 'center', padding: '1rem', marginTop: '0.5rem' }}>
            <button onClick={() => startScenario(scenario)} style={{
              background: `${scenario.color}18`, border: `1px solid ${scenario.color}`,
              borderRadius: 10, padding: '0.75rem 2rem',
              color: scenario.color, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              marginRight: '0.75rem',
            }}>↺ Retry Session</button>
            <button onClick={() => { window.speechSynthesis.cancel(); setScenario(null) }} style={{
              background: 'var(--bg-card2)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '0.75rem 2rem',
              color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            }}>← Choose Another</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {!sessionEnd && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexShrink: 0 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder={listening ? '🎤 Listening… speak now' : 'Type your response or press 🎤 to speak… (Enter to send)'}
              disabled={thinking || listening}
              rows={2}
              style={{
                width: '100%', resize: 'none',
                background: 'var(--bg-card)', border: `1px solid ${listening ? '#ef4444' : 'var(--border)'}`,
                borderRadius: 12, padding: '0.85rem 1rem',
                color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.5,
                outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Voice button */}
          <button onClick={toggleVoice} disabled={thinking} style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: listening ? 'rgba(239,68,68,0.15)' : `${scenario.color}12`,
            border: `1.5px solid ${listening ? '#ef4444' : scenario.color}`,
            color: listening ? '#ef4444' : scenario.color,
            fontSize: '1.2rem', cursor: thinking ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: listening ? 'pulse 1s infinite' : 'none',
            transition: 'all 0.2s',
          }} title={listening ? 'Stop recording' : 'Voice input'}>
            {listening ? '⏹' : '🎤'}
          </button>

          {/* Send button */}
          <button onClick={() => sendMessage(input)} disabled={thinking || !input.trim()} style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: input.trim() && !thinking ? scenario.color : 'var(--bg-card2)',
            border: `1.5px solid ${input.trim() && !thinking ? scenario.color : 'var(--border)'}`,
            color: input.trim() && !thinking ? '#000' : 'var(--text-dim)',
            fontSize: '1.1rem', cursor: thinking || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }} title="Send">
            ➤
          </button>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse  { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}
