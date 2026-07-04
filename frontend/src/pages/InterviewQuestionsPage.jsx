import { useState, useEffect } from 'react'
import { generateQuestions, getQuestionHistory } from '../services/interviewService'
import Loader from '../components/ui/Loader'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

const DIFF_COLORS = { EASY: '#10b981', MEDIUM: '#f59e0b', HARD: '#ef4444' }
const DIFF_BADGE  = { EASY: 'badge-green', MEDIUM: 'badge-yellow', HARD: 'badge-red' }

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false)
  const color = DIFF_COLORS[q.difficulty] ?? '#00d4ff'
  return (
    <div className="card" style={{ padding: '1.1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
            {index + 1}
          </span>
          <p style={{ fontWeight: 600, lineHeight: 1.5, fontSize: '0.92rem' }}>{q.question}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          <span className={`badge ${DIFF_BADGE[q.difficulty] ?? 'badge-cyan'}`} style={{ fontSize: '0.68rem' }}>{q.difficulty}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)} style={{ fontSize: '0.78rem' }}>
            {open ? '▲ Hide' : '▼ Answer'}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expected Answer</span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text)', marginTop: '0.3rem', lineHeight: 1.7 }}>{q.expectedAnswer}</p>
          </div>
          {q.hint && (
            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: '0.6rem 0.85rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💡 Hint  </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{q.hint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SessionView({ session }) {
  const byDiff = (d) => (session.questions ?? []).filter(q => q.difficulty === d)
  const [activeTab, setActiveTab] = useState('ALL')
  const filtered = activeTab === 'ALL' ? (session.questions ?? []) : byDiff(activeTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Diff filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="badge badge-blue" style={{ marginRight: '0.5rem' }}>🔧 {session.technology}</span>
        {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => {
          const count = d === 'ALL' ? (session.questions?.length ?? 0) : byDiff(d).length
          if (count === 0 && d !== 'ALL') return null
          return (
            <button key={d} onClick={() => setActiveTab(d)}
              className={`btn btn-sm ${activeTab === d ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.78rem' }}>
              {d} ({count})
            </button>
          )
        })}
      </div>
      {filtered.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
    </div>
  )
}

export default function InterviewQuestionsPage() {
  const [tech, setTech] = useState('')
  const [difficulty, setDifficulty] = useState('ALL')
  const [counts, setCounts] = useState({ easy: 3, medium: 3, hard: 3 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [tab, setTab] = useState('generate')

  useEffect(() => {
    getQuestionHistory().then(setHistory).catch(() => {}).finally(() => setHistLoading(false))
  }, [])

  const generate = async (e) => {
    e.preventDefault()
    if (!tech.trim()) { setError('Enter a technology or role'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const data = await generateQuestions(tech, difficulty, counts.easy, counts.medium, counts.hard)
      setResult(data)
      setHistory(h => [data, ...h])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 className="page-title">Interview Questions</h2>
        <p className="page-subtitle">Generate targeted Q&A with custom difficulty counts</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {['generate', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t === 'generate' ? '⚡ Generate' : `📋 History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e2f0ff' }}>Generate Questions</span>
            </div>

            <ErrorAlert message={error} onDismiss={() => setError('')} />

            <form onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Tech + Difficulty row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label">Technology / Role *</label>
                  <input className="form-input" placeholder="React, Java, System Design, DSA…"
                    value={tech} onChange={e => setTech(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty Mode</label>
                  <select className="form-input" value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    style={{ minWidth: 130 }}>
                    <option value="ALL">All Levels</option>
                    <option value="EASY">Easy Only</option>
                    <option value="MEDIUM">Medium Only</option>
                    <option value="HARD">Hard Only</option>
                  </select>
                </div>
              </div>

              {/* Question count controls */}
              <div style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
                  Number of Questions
                </div>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {(difficulty === 'ALL' || difficulty === 'EASY') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🟢 Easy</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setCounts(c => ({ ...c, easy: Math.max(1, c.easy - 1) }))}
                          style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>−</button>
                        <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>{counts.easy}</span>
                        <button type="button" onClick={() => setCounts(c => ({ ...c, easy: Math.min(20, c.easy + 1) }))}
                          style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>+</button>
                      </div>
                    </div>
                  )}
                  {(difficulty === 'ALL' || difficulty === 'MEDIUM') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🟡 Medium</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setCounts(c => ({ ...c, medium: Math.max(1, c.medium - 1) }))}
                          style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>−</button>
                        <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 800, color: '#f59e0b', fontSize: '1.1rem' }}>{counts.medium}</span>
                        <button type="button" onClick={() => setCounts(c => ({ ...c, medium: Math.min(20, c.medium + 1) }))}
                          style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>+</button>
                      </div>
                    </div>
                  )}
                  {(difficulty === 'ALL' || difficulty === 'HARD') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔴 Hard</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setCounts(c => ({ ...c, hard: Math.max(1, c.hard - 1) }))}
                          style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>−</button>
                        <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>{counts.hard}</span>
                        <button type="button" onClick={() => setCounts(c => ({ ...c, hard: Math.min(20, c.hard + 1) }))}
                          style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>+</button>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Total: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {difficulty === 'EASY' ? counts.easy
                      : difficulty === 'MEDIUM' ? counts.medium
                      : difficulty === 'HARD' ? counts.hard
                      : counts.easy + counts.medium + counts.hard} questions
                  </span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ alignSelf: 'flex-start', minWidth: 160 }}>
                {loading ? <><span className="spinner" /> Generating…</> : '⚡ Generate Now'}
              </button>
            </form>
          </div>

          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner-lg" style={{ margin: '0 auto 1rem' }} />
              <div style={{ color: 'var(--primary)', fontWeight: 700 }}>AI is crafting your questions…</div>
            </div>
          )}
          {result && <SessionView session={result} />}
        </div>
      )}

      {tab === 'history' && (
        histLoading ? <Loader text="Loading history…" fullPage /> :
        history.length === 0
          ? <EmptyState icon="❓" title="No questions generated yet" subtitle="Generate your first question set to see history" />
          : history.map((s, i) => (
              <div key={s.id ?? i}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>◈</span>
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : `Session #${i + 1}`}
                </p>
                <SessionView session={s} />
                {i < history.length - 1 && <div className="divider" />}
              </div>
            ))
      )}
    </div>
  )
}
