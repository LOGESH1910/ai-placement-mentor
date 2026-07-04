import { useState, useEffect } from 'react'
import { generateRoadmap, getRoadmapHistory } from '../services/roadmapService'
import { useAuth } from '../context/AuthContext'
import TagInput from '../components/ui/TagInput'
import Loader from '../components/ui/Loader'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

const MONTH_COLORS = ['#6366f1', '#10b981', '#f59e0b']
const MONTH_ICONS  = ['🌱', '🚀', '🏆']

function MonthCard({ month, data, index }) {
  const [open, setOpen] = useState(index === 0)
  const [showDays, setShowDays] = useState(false)
  if (!data) return null
  const color = MONTH_COLORS[index]
  const icon  = MONTH_ICONS[index]

  return (
    <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', padding: 0, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{icon}</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700 }}>Month {month}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{data.theme}</div>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'goals',    icon: '🎯', label: 'Goals'    },
            { key: 'topics',   icon: '📚', label: 'Topics'   },
            { key: 'projects', icon: '💡', label: 'Projects' },
          ].map(({ key, icon: ic, label }) => (
            data[key]?.length > 0 && (
              <div key={key}>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ic} {label}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {data[key].map((item, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                      <span style={{ color, flexShrink: 0 }}>›</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}

          {/* Daily Plan */}
          {data.dailyPlan?.length > 0 && (
            <div>
              <button type="button" onClick={() => setShowDays(d => !d)} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: `${color}15`, border: `1px solid ${color}40`,
                borderRadius: 8, padding: '0.5rem 0.85rem', cursor: 'pointer',
                color, fontWeight: 700, fontSize: '0.82rem', marginBottom: showDays ? '0.75rem' : 0,
              }}>
                📅 Day-by-Day Plan ({data.dailyPlan.length} days) {showDays ? '▲' : '▼'}
              </button>
              {showDays && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {data.dailyPlan.map((day, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                      padding: '0.6rem 0.85rem', borderRadius: 8,
                      background: 'var(--bg-card2)', border: '1px solid var(--border)',
                    }}>
                      <span style={{
                        minWidth: 42, height: 24, borderRadius: 6,
                        background: `${color}22`, color, fontWeight: 700,
                        fontSize: '0.72rem', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}>DAY {day.day}</span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text)', flex: 1 }}>{day.task}</span>
                      {day.duration && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'center' }}>⏱ {day.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RoadmapView({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <MonthCard month={1} data={data.month1} index={0} />
      <MonthCard month={2} data={data.month2} index={1} />
      <MonthCard month={3} data={data.month3} index={2} />

      {data.weeklyTasks?.length > 0 && (
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>📅 Weekly Tasks</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.5rem' }}>
            {data.weeklyTasks.map((t, i) => (
              <div key={i} style={{
                background: 'var(--bg-card2)', borderRadius: 8,
                padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)',
                display: 'flex', gap: '0.5rem',
              }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>W{i + 1}</span>{t}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.resources?.length > 0 && (
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🔗 Resources</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.resources.map((r, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#10b981', flexShrink: 0 }}>›</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function RoadmapPage() {
  const { user } = useAuth()
  const [targetRole, setTargetRole] = useState('')
  const [skills, setSkills]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [history, setHistory]       = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [error, setError]           = useState('')
  const [tab, setTab]               = useState('generate')

  useEffect(() => {
    if (user?.targetRole) setTargetRole(user.targetRole)
    if (user?.skills) setSkills(user.skills)
    getRoadmapHistory().then(setHistory).catch(() => {}).finally(() => setHistLoading(false))
  }, [user])

  const generate = async (e) => {
    e.preventDefault()
    if (!targetRole.trim()) { setError('Enter your target role'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const data = await generateRoadmap(targetRole, skills)
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
        <h2 className="page-title">Learning Roadmap</h2>
        <p className="page-subtitle">AI-generated personalised 3-month placement preparation plan</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {['generate', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t === 'generate' ? '🗺️ Generate' : `📋 History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'generate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Generate Your Roadmap</h3>
            <ErrorAlert message={error} onDismiss={() => setError('')} />
            <form onSubmit={generate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Role *</label>
                <input className="form-input" placeholder="SDE at Google, Full Stack Developer, Data Engineer…"
                  value={targetRole} onChange={e => setTargetRole(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Skills (press Enter to add)</label>
                <TagInput value={skills} onChange={setSkills} placeholder="Java, React, SQL…" />
                <span className="text-xs text-muted">{skills.length} skills · or leave blank to use profile skills</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
                {loading ? <><span className="spinner" /> Generating…</> : '🗺️ Generate Roadmap'}
              </button>
            </form>
          </div>

          {loading && <Loader text="AI is building your personalised roadmap…" fullPage />}
          {result && (
            <div>
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                🎉 Your 3-month roadmap is ready! Click each month to expand.
              </div>
              <RoadmapView data={result} />
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        histLoading ? <Loader text="Loading history…" fullPage /> :
        history.length === 0
          ? <EmptyState icon="🗺️" title="No roadmaps yet"
              subtitle="Generate your first roadmap to kickstart your placement prep" />
          : history.map((r, i) => (
              <div key={r.id ?? i}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-purple">🎯 {r.targetRole}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <RoadmapView data={r} />
                {i < history.length - 1 && <div className="divider" />}
              </div>
            ))
      )}
    </div>
  )
}
