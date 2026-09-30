import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import PageHeader from '../components/ui/PageHeader'
import { TOPICS, CATEGORIES, TOTAL_LESSONS } from '../data/learnContent'
import { topicDoneCount } from '../utils/learnProgress'

export default function LearnPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  /* Re-render when returning from a topic page so progress badges refresh */
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onVisible = () => setTick((t) => t + 1)
    window.addEventListener('focus', onVisible)
    return () => window.removeEventListener('focus', onVisible)
  }, [])

  const filtered = TOPICS.filter((t) => {
    const matchesCategory = category === 'All' || t.category === category
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.blurb.toLowerCase().includes(q) ||
      t.lessons.some((l) => l.title.toLowerCase().includes(q))
    return matchesCategory && matchesQuery
  })

  return (
    <div className="anim-slide-up" key={tick}>
      <PageHeader
        icon="book"
        title="Learn"
        subtitle={`${TOPICS.length} interview-focused tracks · ${TOTAL_LESSONS} structured lessons with examples and practice.`}
      />

      {/* Search + filters */}
      <div className="filter-bar" style={{ marginBottom: '1.25rem' }}>
        <div className="filter-field" style={{ flex: '1 1 260px' }}>
          <span>Search</span>
          <div className="search-input-wrap">
            <Icon name="search" size={15} />
            <input
              className="form-input"
              type="search"
              placeholder="Search topics or lessons — e.g. HashMap, joins, paging…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search learning topics"
            />
          </div>
        </div>
        <div className="filter-field">
          <span>Category</span>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" style={{ minWidth: 150 }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Topic grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon"><Icon name="search" size={22} /></span>
          <p className="empty-title">No topics match your search</p>
          <p className="empty-desc">Try a different keyword like “trees”, “SQL” or “OOP”, or clear the filters.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setQuery(''); setCategory('All') }}>Clear search</button>
        </div>
      ) : (
        <div className="topic-grid">
          {filtered.map((t) => {
            const done = topicDoneCount(t.id, t.lessons)
            const pct = Math.round((done / t.lessons.length) * 100)
            return (
              <button key={t.id} className="topic-card" onClick={() => navigate(`/learn/${t.id}`)}>
                <div className="row" style={{ alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <span className="topic-icon" style={{ background: `${t.tint}16`, color: t.tint }}>{t.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.name}</h3>
                    <span className="caption">{t.category} · {t.lessons.length} lessons</span>
                  </div>
                  {pct === 100 ? (
                    <span className="badge badge-success"><Icon name="check" size={11} /> Done</span>
                  ) : done > 0 ? (
                    <span className="badge badge-primary">{pct}%</span>
                  ) : null}
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, minHeight: 42 }}>
                  {t.blurb}
                </p>
                <div style={{ marginTop: '0.9rem' }}>
                  <div className="progress-track">
                    <div className={`progress-fill${pct === 100 ? ' success' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
