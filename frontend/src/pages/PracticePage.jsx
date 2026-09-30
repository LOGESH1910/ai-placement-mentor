import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'
import { QUESTIONS, PRACTICE_CATEGORIES, DIFFICULTIES, QUESTION_TYPES } from '../data/practiceData'

const DONE_KEY = 'apm_practice_done'

function loadDone() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'done', label: 'Completed' },
]

export default function PracticePage() {
  const [params, setParams] = useSearchParams()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const category = params.get('category') ?? 'all'
  const [difficulty, setDifficulty] = useState('All')
  const [qType, setQType] = useState('All')
  const [status, setStatus] = useState('all')
  const [done, setDone] = useState(loadDone)
  const [expandedHint, setExpandedHint] = useState(null)

  useEffect(() => {
    localStorage.setItem(DONE_KEY, JSON.stringify([...done]))
  }, [done])

  const setCategoryParam = (id) => {
    setParams(id === 'all' ? {} : { category: id }, { replace: true })
  }

  /* Sync ?q= from navigation */
  useEffect(() => {
    const q = params.get('q')
    if (q !== null && q !== query) setQuery(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const filtered = useMemo(() => QUESTIONS.filter((q) => {
    if (category !== 'all' && q.category !== category) return false
    if (difficulty !== 'All' && q.difficulty !== difficulty) return false
    if (qType !== 'All' && q.type !== qType) return false
    if (status === 'done' && !done.has(q.id)) return false
    if (status === 'todo' && done.has(q.id)) return false
    const s = query.trim().toLowerCase()
    if (s && !q.title.toLowerCase().includes(s) && !q.topic.toLowerCase().includes(s)) return false
    return true
  }), [category, difficulty, qType, status, done, query])

  const stats = useMemo(() => ({
    total: QUESTIONS.length,
    done: QUESTIONS.filter((q) => done.has(q.id)).length,
  }), [done])

  const toggleDone = (id) =>
    setDone((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="anim-slide-up">
      <PageHeader
        icon="code"
        title="Practice"
        subtitle="Curated placement questions across coding, aptitude, SQL, languages and core CS."
        action={
          <div className="row" style={{ gap: '0.75rem' }}>
            <div className="card card-pad" style={{ padding: '0.55rem 1rem', textAlign: 'center' }}>
              <span className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{stats.done}</span>
              <span className="stat-label" style={{ display: 'block' }}>of {stats.total} completed</span>
            </div>
          </div>
        }
      />

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="filter-field" style={{ flex: '1 1 220px' }}>
          <span>Search</span>
          <div className="search-input-wrap">
            <Icon name="search" size={15} />
            <input
              type="search"
              className="form-input"
              placeholder="Search questions or topics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search questions"
            />
          </div>
        </div>
        <div className="filter-field">
          <span>Category</span>
          <select className="form-select" value={category} onChange={(e) => setCategoryParam(e.target.value)} aria-label="Filter by category">
            {PRACTICE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <span>Difficulty</span>
          <select className="form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} aria-label="Filter by difficulty">
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <span>Type</span>
          <select className="form-select" value={qType} onChange={(e) => setQType(e.target.value)} aria-label="Filter by question type" style={{ minWidth: 110 }}>
            {QUESTION_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-field">
          <span>Status</span>
          <div className="segmented" role="group" aria-label="Filter by completion status">
            {STATUS_FILTERS.map((s) => (
              <button key={s.id} className={status === s.id ? 'active' : ''} onClick={() => setStatus(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon"><Icon name="search" size={22} /></span>
          <p className="empty-title">No questions match your filters</p>
          <p className="empty-desc">Try clearing the search term or switching category and difficulty.</p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setQuery(''); setDifficulty('All'); setQType('All'); setStatus('all'); setCategoryParam('all') }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="flex-col" style={{ gap: '0.7rem' }}>
          {filtered.map((q) => {
            const isDone = done.has(q.id)
            return (
              <article key={q.id} className={`q-card${isDone ? ' done' : ''}`}>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <button
                    onClick={() => toggleDone(q.id)}
                    className={`goal-check${isDone ? ' checked' : ''}`}
                    role="checkbox"
                    aria-checked={isDone}
                    aria-label={`Mark "${q.title}" as ${isDone ? 'not done' : 'completed'}`}
                    style={{ marginTop: 2 }}
                  >
                    {isDone && <Icon name="check" size={11} strokeWidth={3} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 650 }}>{q.title}</h3>
                      <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                        {q.difficulty}
                      </span>
                      <span className="badge badge-neutral">{q.topic}</span>
                      <span className="badge badge-outline">{q.type}</span>
                    </div>
                    <p className="caption row" style={{ marginTop: 6, gap: 6 }}>
                      <Icon name="clock" size={12} /> ~{q.minutes} min
                      <span>·</span> Est. attempt time
                    </p>

                    {expandedHint === q.id && (
                      <div className="alert alert-info anim-fade-in" style={{ marginTop: 10 }}>
                        <Icon name="info" size={14} />
                        <span><strong>Approach hint:</strong> {q.hint}</span>
                      </div>
                    )}
                  </div>

                  <div className="row" style={{ flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Show approach hint" aria-label="Show approach hint"
                      onClick={() => setExpandedHint(expandedHint === q.id ? null : q.id)}>
                      <Icon name="info" size={16} />
                    </button>
                    {q.link ? (
                      <a href={q.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        Solve <Icon name="arrowRight" size={13} />
                      </a>
                    ) : (
                      <button
                        className={`btn btn-sm ${isDone ? 'btn-ghost' : 'btn-secondary'}`}
                        onClick={() => toggleDone(q.id)}
                      >
                        {isDone ? 'Completed ✓' : 'Mark done'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* AI-assisted practice CTA */}
      <div className="card card-pad" style={{ marginTop: '1.5rem', background: 'linear-gradient(120deg, var(--primary-muted), transparent 70%)' }}>
        <div className="spread" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="row" style={{ gap: '0.9rem' }}>
            <span className="tile-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
              <Icon name="sparkles" size={19} />
            </span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Want unlimited questions?</p>
              <p className="caption">The AI Mentor generates personalised problem sets for any topic and difficulty.</p>
            </div>
          </div>
          <Link to="/ai-mentor" className="btn btn-primary">Generate with AI</Link>
        </div>
      </div>
    </div>
  )
}
