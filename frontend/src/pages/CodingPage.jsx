import { useState, useEffect } from 'react'
import { getCodingRecommendations, getCodingHistory } from '../services/codingService'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/ui/Loader'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

const DIFF_STYLE = {
  EASY:   { bg: 'rgba(16,185,129,0.1)',  color: '#6ee7b7',  label: '🟢 Easy'   },
  MEDIUM: { bg: 'rgba(245,158,11,0.1)',  color: '#fcd34d',  label: '🟡 Medium' },
  HARD:   { bg: 'rgba(239,68,68,0.1)',   color: '#fca5a5',  label: '🔴 Hard'   },
}

function ProblemList({ title, problems, diffKey }) {
  if (!problems?.length) return null
  const style = DIFF_STYLE[diffKey] ?? DIFF_STYLE.MEDIUM
  return (
    <div className="card">
      <h4 style={{ fontWeight: 700, marginBottom: '0.85rem', color: style.color }}>{style.label} — {title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {problems.map((p, i) => (
          <div key={i} style={{
            background: style.bg, borderRadius: 8, padding: '0.75rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.3rem',
            border: `1px solid ${style.color}30`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 600 }}>{p.title}</span>
              {p.link && p.link.startsWith('http') && (
                <a href={p.link} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.75rem', fontWeight: 700, color: '#f97316',
                    background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                    borderRadius: 6, padding: '0.25rem 0.6rem', textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.1)'}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0z"/></svg>
                  LeetCode ↗
                </a>
              )}
            </div>
            {p.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RecommendationView({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ProblemList title="Problems" problems={data.easyProblems}   diffKey="EASY" />
      <ProblemList title="Problems" problems={data.mediumProblems} diffKey="MEDIUM" />
      <ProblemList title="Problems" problems={data.hardProblems}   diffKey="HARD" />

      {data.practicePlan?.length > 0 && (
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>📅 Practice Plan</h4>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.practicePlan.map((p, i) => (
              <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{p}</li>
            ))}
          </ol>
        </div>
      )}

      {data.interviewTips?.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>💡 Interview Tips</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.interviewTips.map((t, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#a5b4fc', flexShrink: 0 }}>›</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function CodingPage() {
  const { user } = useAuth()
  const [topic, setTopic]           = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [counts, setCounts]         = useState({ easy: 3, medium: 3, hard: 3 })
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [history, setHistory]       = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [error, setError]           = useState('')
  const [tab, setTab]               = useState('recommend')

  useEffect(() => {
    if (user?.targetRole) setTargetRole(user.targetRole)
    getCodingHistory().then(setHistory).catch(() => {}).finally(() => setHistLoading(false))
  }, [user])

  const recommend = async (e) => {
    e.preventDefault()
    if (!topic.trim() && !targetRole.trim()) { setError('Enter a topic or target role'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const data = await getCodingRecommendations(topic, targetRole, counts.easy, counts.medium, counts.hard)
      setResult(data)
      setHistory(h => [data, ...h])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const Counter = ({ label, color, dotColor, field }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: dotColor, marginRight: 4 }} />
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button type="button" onClick={() => setCounts(c => ({ ...c, [field]: Math.max(1, c[field] - 1) }))}
          style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 800, color, fontSize: '1.1rem' }}>{counts[field]}</span>
        <button type="button" onClick={() => setCounts(c => ({ ...c, [field]: Math.min(20, c[field] + 1) }))}
          style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
    </div>
  )

  const TOPICS = ['Arrays', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Graphs', 'Sorting', 'Recursion', 'Backtracking']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 className="page-title">Coding Prep</h2>
        <p className="page-subtitle">AI-curated DSA problems with a personalised practice plan</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {['recommend', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t === 'recommend' ? '💻 Get Problems' : `📋 History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'recommend' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Configure Recommendations</h3>
            <ErrorAlert message={error} onDismiss={() => setError('')} />
            <form onSubmit={recommend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">DSA Topic</label>
                  <input className="form-input" placeholder="Dynamic Programming, Trees…"
                    value={topic} onChange={e => setTopic(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Role</label>
                  <input className="form-input" placeholder="SDE at Google, Data Engineer…"
                    value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                </div>
              </div>
              {/* Problem count controls */}
              <div style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: '0.85rem 1.1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
                  Number of Problems
                </div>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <Counter label="Easy"   color="#10b981" dotColor="#10b981" field="easy" />
                  <Counter label="Medium" color="#f59e0b" dotColor="#f59e0b" field="medium" />
                  <Counter label="Hard"   color="#ef4444" dotColor="#ef4444" field="hard" />
                </div>
                <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{counts.easy + counts.medium + counts.hard} problems</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Quick select topic:</p>
                <div className="tag-list">
                  {TOPICS.map(t => (
                    <button key={t} type="button"
                      onClick={() => setTopic(t)}
                      style={{
                        padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.8rem',
                        background: topic === t ? 'rgba(99,102,241,0.2)' : 'var(--bg-card2)',
                        border: `1px solid ${topic === t ? 'var(--primary)' : 'var(--border)'}`,
                        color: topic === t ? '#a5b4fc' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'var(--transition)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? <><span className="spinner" /> Generating…</> : '💻 Get Problems'}
              </button>
            </form>
          </div>

          {loading && <Loader text="AI is curating problems for you…" fullPage />}
          {result && <RecommendationView data={result} />}
        </div>
      )}

      {tab === 'history' && (
        histLoading ? <Loader text="Loading history…" fullPage /> :
        history.length === 0
          ? <EmptyState icon="💻" title="No recommendations yet"
              subtitle="Get your first coding recommendations to see history" />
          : history.map((r, i) => (
              <div key={r.id ?? i}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {r.topic && <span className="badge badge-blue">{r.topic}</span>}
                  {r.targetRole && <span className="badge badge-purple">{r.targetRole}</span>}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <RecommendationView data={r} />
                {i < history.length - 1 && <div className="divider" />}
              </div>
            ))
      )}
    </div>
  )
}
