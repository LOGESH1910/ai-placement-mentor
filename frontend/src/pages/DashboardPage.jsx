import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMockHistory } from '../services/interviewService'
import { getResumeHistory } from '../services/resumeService'
import { getCodingHistory } from '../services/codingService'
import ScoreRing from '../components/ui/ScoreRing'
import { scoreColor, scoreLabel } from '../utils/score'
import Icon from '../components/ui/Icon'
import { TOPICS } from '../data/learnContent'

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const GOALS_KEY = 'apm_daily_goals'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

const DEFAULT_GOALS = [
  { id: 'code', label: 'Complete 10 coding questions', link: '/practice' },
  { id: 'learn', label: 'Study one Learn module', link: '/learn' },
  { id: 'apt', label: 'Practice 10 aptitude questions', link: '/practice?category=aptitude' },
  { id: 'mock', label: 'Attempt one mock interview', link: '/interview' },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadGoals() {
  try {
    const raw = JSON.parse(localStorage.getItem(GOALS_KEY))
    if (raw?.date === todayKey()) return raw.checked
  } catch { /* corrupted storage — reset */ }
  return {}
}

/* ── Section shell ───────────────────────────────────────────────────────── */
function Section({ title, sub, action, children, style }) {
  return (
    <section className="card card-pad" style={style} aria-label={title}>
      <div className="spread" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-title">{title}</h2>
          {sub && <p className="section-sub">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/* ── Quick practice catalogue ────────────────────────────────────────────── */
const QUICK_PRACTICE = [
  { id: 'coding', label: 'Coding', icon: 'code', color: '#4f46e5', difficulty: 'Easy → Hard', count: 120, minutes: 30 },
  { id: 'aptitude', label: 'Aptitude', icon: 'target', color: '#d97706', difficulty: 'Easy', count: 75, minutes: 15 },
  { id: 'sql', label: 'SQL', icon: 'fileText', color: '#059669', difficulty: 'Medium', count: 45, minutes: 20 },
  { id: 'java', label: 'Java', icon: 'zap', color: '#ea580c', difficulty: 'Medium', count: 60, minutes: 20 },
  { id: 'python', label: 'Python', icon: 'play', color: '#0284c7', difficulty: 'Medium', count: 55, minutes: 20 },
  { id: 'dsa', label: 'DSA', icon: 'chart', color: '#dc2626', difficulty: 'Hard', count: 90, minutes: 35 },
  { id: 'mcq', label: 'Technical MCQs', icon: 'check', color: '#7c3aed', difficulty: 'Easy', count: 80, minutes: 12 },
  { id: 'hr', label: 'HR Questions', icon: 'user', color: '#0891b2', difficulty: 'All levels', count: 30, minutes: 25 },
]

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [mockHistory, setMockHistory] = useState([])
  const [resumeHistory, setResumeHistory] = useState([])
  const [codingHistory, setCodingHistory] = useState([])
  const [loading, setLoading] = useState(true)

  /* Goals state persisted per-day in localStorage */
  const [checkedGoals, setCheckedGoals] = useState(loadGoals)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getMockHistory(), getResumeHistory(), getCodingHistory()])
      .then(([mock, resume, coding]) => {
        if (cancelled) return
        if (mock.status === 'fulfilled') setMockHistory(mock.value ?? [])
        if (resume.status === 'fulfilled') setResumeHistory(resume.value ?? [])
        if (coding.status === 'fulfilled') setCodingHistory(coding.value ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify({ date: todayKey(), checked: checkedGoals }))
  }, [checkedGoals])

  const toggleGoal = (id) =>
    setCheckedGoals((c) => ({ ...c, [id]: !c[id] }))

  const score = user?.placementReadinessScore ?? 0
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  /* Derived readiness breakdown (real data where available) */
  const readiness = useMemo(() => {
    const avg = (arr, key) =>
      arr.length ? Math.round(arr.reduce((s, m) => s + (m[key] ?? 0), 0) / arr.length) : null
    return [
      { label: 'Coding', value: avg(codingHistory, 'score') ?? Math.min(85, score + 8), color: 'var(--primary)' },
      { label: 'Aptitude', value: Math.max(35, Math.min(90, score + 5)), color: 'var(--info)' },
      { label: 'Technical Interview', value: avg(mockHistory, 'technicalScore') ?? Math.max(25, score - 5), color: 'var(--violet)' },
      { label: 'Communication', value: avg(mockHistory, 'communicationScore'), color: 'var(--success)' },
      { label: 'Resume', value: avg(resumeHistory, 'atsScore'), color: 'var(--warning)' },
    ]
  }, [mockHistory, resumeHistory, codingHistory, score])

  /* Current learning path — first topic with unfinished lessons */
  const currentPath = useMemo(() => {
    let progressMap = {}
    try { progressMap = JSON.parse(localStorage.getItem('apm_lesson_progress') ?? '{}') } catch { /* ignore */ }
    for (const t of TOPICS) {
      const doneCount = t.lessons.filter((_, i) => progressMap[`${t.id}:${i}`]).length
      if (doneCount < t.lessons.length && doneCount > 0) {
        return { topic: t, done: doneCount, nextLessonIdx: t.lessons.findIndex((_, i) => !progressMap[`${t.id}:${i}`]) }
      }
    }
    // Nothing started → recommend first topic
    const t = TOPICS[0]
    return { topic: t, done: 0, nextLessonIdx: 0 }
  }, [])

  const pct = Math.round((currentPath.done / currentPath.topic.lessons.length) * 100)

  /* Recent activity feed */
  const activity = useMemo(() => (
    [
      ...mockHistory.slice(0, 3).map((m) => ({
        icon: 'mic', color: 'var(--violet)', tint: 'var(--violet-muted)',
        title: `Mock interview — ${m.technology ?? 'General'}`,
        meta: m.score != null ? `Scored ${m.score}%` : 'Completed with feedback',
        time: m.createdAt,
      })),
      ...resumeHistory.slice(0, 2).map((r) => ({
        icon: 'fileText', color: 'var(--info)', tint: 'var(--info-muted)',
        title: 'Resume analysed',
        meta: `${r.matchedSkills?.length ?? 0} skills matched`,
        time: r.createdAt,
      })),
      ...codingHistory.slice(0, 2).map((c) => ({
        icon: 'code', color: 'var(--success)', tint: 'var(--success-muted)',
        title: `Coding set — ${c.topic || c.targetRole || 'Practice'}`,
        meta: `${c.problems?.length ?? 0} problems generated`,
        time: c.createdAt,
      })),
    ]
      .filter((a) => a.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)
  ), [mockHistory, resumeHistory, codingHistory])

  const goalsDone = DEFAULT_GOALS.filter((g) => checkedGoals[g.id]).length

  const askAI = (prompt) => {
    navigate('/ai-mentor', { state: { initialPrompt: prompt } })
  }

  if (loading) {
    return (
      <div className="flex-col" style={{ gap: '1.25rem' }} aria-busy="true">
        <div className="skeleton" style={{ height: 150, borderRadius: 14 }} />
        <div className="dash-grid">
          <div className="flex-col" style={{ gap: '1.25rem' }}>
            <div className="skeleton" style={{ height: 190, borderRadius: 14 }} />
            <div className="skeleton" style={{ height: 230, borderRadius: 14 }} />
          </div>
          <div className="flex-col" style={{ gap: '1.25rem' }}>
            <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
            <div className="skeleton" style={{ height: 180, borderRadius: 14 }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="anim-slide-up flex-col" style={{ gap: '1.25rem' }}>

      {/* ── Section 1 · Welcome ─────────────────────────────────────────── */}
      <section className="welcome-banner" aria-label="Welcome">
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <span className="badge badge-primary" style={{ marginBottom: 10 }}>
              <Icon name="flame" size={11} /> {goalsDone}/{DEFAULT_GOALS.length} daily goals complete
            </span>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.65rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, {firstName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem', maxWidth: 480 }}>
              Continue your placement preparation and build your interview confidence.
              {user?.targetRole ? <> Target role: <strong>{user.targetRole}</strong>.</> : ''}
            </p>
            <div className="row" style={{ marginTop: '1.1rem', flexWrap: 'wrap' }}>
              <Link to={`/learn/${currentPath.topic.id}`} className="btn btn-primary">
                <Icon name="play" size={14} /> Continue Learning
              </Link>
              <Link to="/ai-mentor" className="btn btn-secondary">
                <Icon name="sparkles" size={14} /> Ask AI Mentor
              </Link>
            </div>
          </div>

          {/* Readiness snapshot */}
          <div className="row" style={{ gap: '1rem' }}>
            <ScoreRing score={score} size={116} />
            <div className="flex-col" style={{ gap: 4 }}>
              <span className="label">Placement readiness</span>
              <strong style={{ fontSize: '0.95rem', color: scoreColor(score) }}>{scoreLabel(score)}</strong>
              <Link to="/progress" className="small" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                View analytics →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2 · Placement Readiness breakdown ───────────────────── */}
      <Section
        title="Placement Readiness"
        sub="Skill-level scores derived from your practice sessions"
        action={<span className={`badge ${score >= 70 ? 'badge-success' : score >= 45 ? 'badge-warning' : 'badge-danger'}`}>{score}% overall</span>}
      >
        <div className="ready-split">
          <div className="flex-col" style={{ alignItems: 'center', gap: 6 }}>
            <ScoreRing score={score} size={128} />
            <span className="caption">{scoreLabel(score)}</span>
          </div>
          <div className="flex-col">
            {readiness.map((r) => (
              <div key={r.label} className="skill-row">
                <span className="skill-name">{r.label}</span>
                <div className="skill-track progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${r.value ?? 0}%`,
                      background: r.color,
                    }}
                  />
                </div>
                <span className="skill-pct" style={{ color: r.color }}>{r.value ?? '—'}{r.value != null ? '%' : ''}</span>
              </div>
            ))}
          </div>
        </div>
        {(readiness.some((r) => r.value == null)) && (
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            <Icon name="info" size={15} />
            <span>Some scores need more data. Take a <Link to="/interview" style={{ fontWeight: 700 }}>mock interview</Link> or analyse your <Link to="/resume" style={{ fontWeight: 700 }}>resume</Link> to complete the picture.</span>
          </div>
        )}
      </Section>

      {/* ── Main two-column zone ────────────────────────────────────────── */}
      <div className="dash-grid">

        {/* Left column */}
        <div className="flex-col" style={{ gap: '1.25rem' }}>

          {/* Section 3 · Continue Learning */}
          <Section
            title="Continue Learning"
            sub="Pick up where you left off"
            action={<Link to="/learn" className="btn btn-ghost btn-sm">All topics <Icon name="arrowRight" size={13} /></Link>}
          >
            <div className="row" style={{ gap: '1rem', alignItems: 'flex-start' }}>
              <div className="topic-icon" style={{ background: `${currentPath.topic.tint}18`, color: currentPath.topic.tint, width: 48, height: 48, fontSize: '1.35rem' }}>
                {currentPath.topic.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{currentPath.topic.name} — Interview Preparation</h3>
                <p className="caption" style={{ margin: '2px 0 10px' }}>
                  Lesson {Math.min(currentPath.nextLessonIdx + 1, currentPath.topic.lessons.length)}:{' '}
                  {currentPath.topic.lessons[currentPath.nextLessonIdx]?.title}
                </p>
                <div className="spread caption" style={{ marginBottom: 6 }}>
                  <span>{currentPath.done}/{currentPath.topic.lessons.length} lessons completed</span>
                  <span>{pct}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <Link to={`/learn/${currentPath.topic.id}`} className="btn btn-primary btn-sm" style={{ alignSelf: 'center' }}>
                Continue
              </Link>
            </div>
          </Section>

          {/* Section 4 · Quick Practice */}
          <Section
            title="Quick Practice"
            sub="Short focused sets across every placement area"
            action={<Link to="/practice" className="btn btn-ghost btn-sm">Browse all <Icon name="arrowRight" size={13} /></Link>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: '0.7rem' }}>
              {QUICK_PRACTICE.map((q) => (
                <button key={q.id} className="practice-tile" onClick={() => navigate(q.id === 'hr' ? '/interview?tab=hr' : `/practice?category=${q.id}`)}>
                  <span className="tile-icon" style={{ background: `${q.color}14`, color: q.color }}>
                    <Icon name={q.icon} size={17} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '0.84rem', fontWeight: 650 }}>{q.label}</span>
                    <span className="caption" style={{ display: 'block' }}>
                      {q.difficulty} · {q.count}+ questions · ~{q.minutes} min
                    </span>
                  </span>
                  <span style={{ color: q.color }}><Icon name="arrowRight" size={15} /></span>
                </button>
              ))}
            </div>
          </Section>

          {/* Section 5 · AI Mentor */}
          <Section
            title="Ask your AI Placement Mentor"
            sub="Instant guidance on strategy, concepts, roadmaps and answers"
            action={<Link to="/ai-mentor" className="btn btn-ghost btn-sm">Open workspace <Icon name="arrowRight" size={13} /></Link>}
          >
            <div className="chip-row" style={{ marginBottom: '0.9rem' }}>
              {[
                'How should I prepare for a Java interview?',
                'Give me a DSA roadmap',
                'What should I study today?',
                'Conduct a mock interview',
              ].map((s) => (
                <button key={s} className="chip" onClick={() => askAI(s)}>{s}</button>
              ))}
            </div>
            <button
              onClick={() => navigate('/ai-mentor')}
              className="form-input"
              style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer', color: 'var(--text-dim)' }}
              aria-label="Open AI mentor chat"
            >
              <Icon name="sparkles" size={15} />
              Ask anything about your preparation…
            </button>
          </Section>
        </div>

        {/* Right column */}
        <div className="flex-col" style={{ gap: '1.25rem' }}>

          {/* Section 6 · Today's Goal */}
          <Section
            title="Today's Placement Goal"
            sub={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            action={
              <span className={`badge ${goalsDone === DEFAULT_GOALS.length ? 'badge-success' : 'badge-neutral'}`}>
                {goalsDone}/{DEFAULT_GOALS.length} done
              </span>
            }
          >
            <div role="group" aria-label="Daily goals">
              {DEFAULT_GOALS.map((g) => {
                const done = Boolean(checkedGoals[g.id])
                return (
                  <div key={g.id} className="goal-item">
                    <button
                      className={`goal-check${done ? ' checked' : ''}`}
                      onClick={() => toggleGoal(g.id)}
                      role="checkbox"
                      aria-checked={done}
                      aria-label={`Mark "${g.label}" as ${done ? 'incomplete' : 'complete'}`}
                    >
                      {done && <Icon name="check" size={12} strokeWidth={3} />}
                    </button>
                    <span className={`goal-label${done ? ' done' : ''}`}>{g.label}</span>
                    <Link to={g.link} className="icon-btn" style={{ width: 28, height: 28 }} aria-label={`Go to ${g.label}`}>
                      <Icon name="arrowRight" size={14} />
                    </Link>
                  </div>
                )
              })}
            </div>
            <div className="progress-track" style={{ marginTop: '0.5rem' }}>
              <div
                className={`progress-fill${goalsDone === DEFAULT_GOALS.length ? ' success' : ''}`}
                style={{ width: `${(goalsDone / DEFAULT_GOALS.length) * 100}%` }}
              />
            </div>
          </Section>

          {/* Section 7 · Recent Activity */}
          <Section title="Recent Activity" sub="Your latest sessions across the platform">
            {activity.length === 0 ? (
              <div className="empty-state" style={{ padding: '1.75rem 1rem' }}>
                <span className="empty-icon"><Icon name="clock" size={22} /></span>
                <p className="empty-title">No sessions yet</p>
                <p className="empty-desc">Start a practice set or mock interview and your activity will appear here.</p>
                <Link to="/practice" className="btn btn-secondary btn-sm">Start practicing</Link>
              </div>
            ) : (
              <div>
                {activity.map((a, i) => (
                  <div key={i} className="timeline-item">
                    <span className="timeline-dot" style={{ background: a.tint, color: a.color }}>
                      <Icon name={a.icon} size={13} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.83rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.title}
                      </p>
                      <p className="caption">{a.meta}</p>
                    </div>
                    <span className="caption" style={{ whiteSpace: 'nowrap', alignSelf: 'flex-start', paddingTop: 4 }}>
                      {timeAgo(a.time)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Streak card */}
          <div className="card card-pad" style={{ background: 'linear-gradient(135deg, var(--primary-muted), transparent)' }}>
            <div className="row" style={{ gap: '0.9rem' }}>
              <span className="tile-icon" style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
                <Icon name="flame" size={19} />
              </span>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>Keep your streak alive</p>
                <p className="caption" style={{ lineHeight: 1.55 }}>
                  Consistent daily practice beats cramming. Complete today&apos;s goals to stay on track.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
