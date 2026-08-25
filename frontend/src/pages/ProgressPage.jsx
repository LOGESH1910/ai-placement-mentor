import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/ui/PageHeader'
import ScoreRing from '../components/ui/ScoreRing'
import { scoreColor, scoreLabel } from '../utils/score'
import Icon from '../components/ui/Icon'
import { getMockHistory } from '../services/interviewService'
import { getResumeHistory } from '../services/resumeService'
import { getCodingHistory } from '../services/codingService'

const DONE_KEY = 'apm_practice_done'
const LESSON_KEY = 'apm_lesson_progress'

function loadJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) ?? fallback)
  } catch {
    return JSON.parse(fallback)
  }
}

/* ── Weekly activity bar chart ───────────────────────────────────────────── */
function WeeklyChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 4)
  return (
    <div className="bar-chart" role="img" aria-label="Weekly activity chart">
      {data.map((d) => (
        <div key={d.day} className="bar-chart-col" title={`${d.day}: ${d.value} activities`}>
          <div className="bar-chart-bar" style={{
            height: `${(d.value / max) * 100}%`,
            background: d.value === max && d.value > 0 ? 'var(--primary)' : 'var(--primary)',
            opacity: d.value > 0 ? 0.9 : 0.25,
          }} />
          <span className="bar-chart-label">{d.day}</span>
        </div>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mocks, setMocks] = useState([])
  const [resumes, setResumes] = useState([])
  const [codings, setCodings] = useState([])

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getMockHistory(), getResumeHistory(), getCodingHistory()])
      .then(([m, r, c]) => {
        if (cancelled) return
        if (m.status === 'fulfilled') setMocks(m.value ?? [])
        if (r.status === 'fulfilled') setResumes(r.value ?? [])
        if (c.status === 'fulfilled') setCodings(c.value ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  /* Local progress signals */
  const doneSet = useMemo(() => new Set(loadJSON(DONE_KEY, '[]')), [])
  const lessonProgress = useMemo(() => loadJSON(LESSON_KEY, '{}'), [])

  const stats = useMemo(() => {
    const avg = (arr, key) =>
      arr.length ? Math.round(arr.reduce((s, x) => s + (x[key] ?? 0), 0) / arr.length) : null

    /* Skill performance — combine real scores with local practice */
    const skills = [
      { name: 'Coding', value: avg(codings, 'score') ?? Math.min(90, 30 + doneSet.size * 3) },
      { name: 'Aptitude', value: Math.min(95, 25 + doneSet.size * 2) },
      { name: 'Technical', value: avg(mocks, 'technicalScore') },
      { name: 'Communication', value: avg(mocks, 'communicationScore') },
      { name: 'Confidence', value: avg(mocks, 'confidenceScore') },
      { name: 'Resume', value: avg(resumes, 'atsScore') },
    ]

    const known = skills.filter((s) => s.value != null)
    const strong = [...known].sort((a, b) => b.value - a.value).slice(0, 2)
    const weak = [...known].sort((a, b) => a.value - b.value).slice(0, 2)

    /* Lessons completed across all topics */
    const lessonsDone = Object.values(lessonProgress).filter(Boolean).length

    /* Weekly activity — derived deterministically from real session dates */
    const week = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
      const end = start + 86400000
      const count =
        mocks.filter((m) => { const t = new Date(m.createdAt).getTime(); return t >= start && t < end }).length +
        resumes.filter((r) => { const t = new Date(r.createdAt).getTime(); return t >= start && t < end }).length +
        codings.filter((c) => { const t = new Date(c.createdAt).getTime(); return t >= start && t < end }).length
      week.push({ day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()], value: count })
    }

    /* Learning streak — consecutive days with any session (from history) */
    const allDates = [
      ...mocks.map((m) => new Date(m.createdAt).toDateString()),
      ...resumes.map((r) => new Date(r.createdAt).toDateString()),
      ...codings.filter((c) => c.createdAt).map((c) => new Date(c.createdAt).toDateString()),
    ]
    const uniqueDays = new Set(allDates)
    let streak = 0
    for (let i = 0; i < 60; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (uniqueDays.has(d.toDateString())) streak++
      else if (i > 0) break
    }

    return { skills, strong, weak, lessonsDone, week, streak, sessions: mocks.length + resumes.length + codings.length }
  }, [mocks, resumes, codings, doneSet, lessonProgress])

  const score = user?.placementReadinessScore ?? 0

  if (loading) {
    return (
      <div aria-busy="true" className="flex-col" style={{ gap: '1.25rem' }}>
        <div className="skeleton" style={{ height: 120 }} />
        <div className="grid grid-2">
          <div className="skeleton" style={{ height: 240 }} />
          <div className="skeleton" style={{ height: 240 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="anim-slide-up flex-col" style={{ gap: '1.25rem' }}>
      <PageHeader
        icon="chart"
        title="Progress"
        subtitle="Analytics across practice, interviews and learning — see what to improve next."
      />

      {/* ── Overview strip ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="card card-pad spread" style={{ alignItems: 'center' }}>
          <div>
            <span className="stat-label">Placement readiness</span>
            <div className="stat-value" style={{ color: scoreColor(score) }}>{score}%</div>
            <span className="caption">{scoreLabel(score)}</span>
          </div>
          <ScoreRing score={score} size={72} stroke={9} label="" />
        </div>
        {[
          ['Sessions completed', stats.sessions, 'mic'],
          ['Lessons completed', stats.lessonsDone, 'book'],
          ['Practice questions done', doneSet.size, 'check'],
          ['Day streak', stats.streak, 'flame'],
        ].map(([label, value, icon]) => (
          <div key={label} className="card card-pad row" style={{ gap: '0.9rem' }}>
            <span className="tile-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
              <Icon name={icon} size={18} />
            </span>
            <div>
              <div className="stat-value" style={{ fontSize: '1.45rem' }}>{value}</div>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Left column */}
        <div className="flex-col" style={{ gap: '1.25rem' }}>

          {/* Weekly activity */}
          <section className="card card-pad" aria-label="Weekly activity">
            <h2 className="section-title">Weekly Activity</h2>
            <p className="section-sub" style={{ marginBottom: '1rem' }}>Sessions per day over the last 7 days</p>
            {stats.week.every((d) => d.value === 0) ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <span className="empty-icon"><Icon name="chart" size={20} /></span>
                <p className="empty-title">No activity this week yet</p>
                <p className="empty-desc">Complete a practice set or mock interview to populate your activity chart.</p>
                <Link to="/practice" className="btn btn-secondary btn-sm">Start practicing</Link>
              </div>
            ) : (
              <WeeklyChart data={stats.week} />
            )}
          </section>

          {/* Skill performance */}
          <section className="card card-pad" aria-label="Skill performance">
            <h2 className="section-title">Skill Performance</h2>
            <p className="section-sub" style={{ marginBottom: '0.5rem' }}>Average scores from your sessions</p>
            {stats.skills.every((s) => s.value == null) && (
              <div className="alert alert-info" style={{ marginTop: 8 }}>
                <Icon name="info" size={14} />
                <span>Take a mock interview or analyse your resume to unlock detailed skill scoring.</span>
              </div>
            )}
            {stats.skills.map((s) => (
              <div key={s.name} className="skill-row">
                <span className="skill-name">{s.name}</span>
                <div className="skill-track progress-track">
                  <div className={`progress-fill${s.value != null && s.value >= 70 ? ' success' : s.value != null && s.value < 45 ? ' danger' : ''}`}
                    style={{ width: `${s.value ?? 0}%` }} />
                </div>
                <span className="skill-pct">{s.value != null ? `${s.value}%` : '—'}</span>
              </div>
            ))}
          </section>
        </div>

        {/* Right column */}
        <div className="flex-col" style={{ gap: '1.25rem' }}>

          {/* Strong areas */}
          <section className="card card-pad" aria-label="Strong areas">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="award" size={16} /> Strong Areas
            </h2>
            <div className="flex-col" style={{ marginTop: '0.75rem', gap: 10 }}>
              {stats.strong.length === 0 ? (
                <p className="caption">Complete sessions to discover your strengths.</p>
              ) : stats.strong.map((s) => (
                <div key={s.name} className="spread">
                  <span className="small" style={{ fontWeight: 600 }}>{s.name}</span>
                  <span className="badge badge-success">{s.value}%</span>
                </div>
              ))}
              {stats.strong.length === 0 && <Link to="/interview?tab=mock" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>Take a mock interview</Link>}
            </div>
          </section>

          {/* Weak areas */}
          <section className="card card-pad" aria-label="Weak areas">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="target" size={16} /> Focus Areas
            </h2>
            <div className="flex-col" style={{ marginTop: '0.75rem', gap: 10 }}>
              {stats.weak.length === 0 ? (
                <p className="caption">Your focus areas appear after scored sessions.</p>
              ) : stats.weak.map((s) => (
                <div key={s.name} className="spread">
                  <span className="small" style={{ fontWeight: 600 }}>{s.name}</span>
                  <span className="badge badge-warning">{s.value}%</span>
                </div>
              ))}
            </div>
            <Link to="/ai-mentor" state={{ initialPrompt: `Create a focused improvement plan for my weakest skill areas.` }}
              className="btn btn-primary btn-sm btn-block" style={{ marginTop: '0.9rem' }}>
              <Icon name="sparkles" size={13} /> Ask AI for an improvement plan
            </Link>
          </section>

          {/* Recent interview attempts */}
          <section className="card card-pad" aria-label="Recent interview attempts">
            <h2 className="section-title">Recent Interview Attempts</h2>
            {mocks.length === 0 ? (
              <p className="caption" style={{ marginTop: 8 }}>No mock interviews yet.</p>
            ) : (
              <div className="flex-col" style={{ marginTop: '0.75rem' }}>
                {mocks.slice(0, 5).map((m, i) => (
                  <div key={i} className="spread small" style={{ padding: '0.5rem 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontWeight: 600 }}>{m.technology ?? 'Interview'}</span>
                    <span className="row" style={{ gap: 6 }}>
                      {m.score != null && <span className={`badge ${m.score >= 70 ? 'badge-success' : m.score >= 45 ? 'badge-warning' : 'badge-danger'}`}>{m.score}%</span>}
                      <span className="caption">{new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
