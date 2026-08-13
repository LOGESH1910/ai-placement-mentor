import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMockHistory } from '../services/interviewService'
import { getResumeHistory } from '../services/resumeService'
import { getCodingHistory } from '../services/codingService'
import { getRoadmapHistory } from '../services/roadmapService'
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function scoreColor(n) {
  if (n >= 70) return '#10b981'
  if (n >= 45) return '#f59e0b'
  return '#ef4444'
}
function scoreLabel(n) {
  if (n >= 70) return 'Placement Ready'
  if (n >= 45) return 'On Track'
  return 'Needs Focus'
}
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ─── Score Ring SVG ────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 120 }) {
  const r = 46
  const circ = 2 * Math.PI * r
  const fill = circ * score / 100
  const color = scoreColor(score)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth="9" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  )
}

/* ─── Mini bar chart for skills ─────────────────────────────────────────── */
function SkillBar({ label, pct, color, delay = 0 }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 200 + delay); return () => clearTimeout(t) }, [pct, delay])
  return (
    <div style={{ marginBottom: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.73rem', fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${width}%`, background: color, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 6px ${color}55` }} />
      </div>
    </div>
  )
}

/* ─── Trend sparkline (pure CSS bar chart) ──────────────────────────────── */
function Sparkline({ data, color = 'var(--primary)' }) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, background: i === data.length - 1 ? color : `${color}55`,
          borderRadius: '2px 2px 0 0',
          height: `${(v / max) * 100}%`,
          minHeight: 3,
          transition: `height 0.6s ease ${i * 0.06}s`,
        }} />
      ))}
    </div>
  )
}

/* ─── Section label ─────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
      <span style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

/* ─── AI Priority card ──────────────────────────────────────────────────── */
function AIPriority({ score, mockCount, resumeCount, targetRole }) {
  const getInsight = () => {
    if (!targetRole) return {
      priority: 'Complete your profile',
      reason: 'Set your target role to unlock personalised AI recommendations and accurate readiness tracking.',
      impact: 'Unlocks personalised plan',
      cta: 'Go to Profile', link: '/profile', urgency: 'warning',
    }
    if (resumeCount === 0) return {
      priority: 'Analyse your resume first',
      reason: 'Your resume is the foundation. AI cannot match your skills to job requirements without it.',
      impact: '+12–18 readiness points',
      cta: 'Analyse Resume', link: '/resume', urgency: 'high',
    }
    if (mockCount === 0) return {
      priority: 'Take your first mock interview',
      reason: 'No interview data means AI cannot identify your communication or technical weaknesses.',
      impact: '+8–12 readiness points',
      cta: 'Start Mock Interview', link: '/interview/mock', urgency: 'high',
    }
    if (score < 40) return {
      priority: 'Focus on DSA fundamentals',
      reason: `Your readiness is ${score}%. DSA is the highest-weight factor in tech placements. Start with arrays and strings.`,
      impact: '+10–15 readiness points',
      cta: 'Practice Coding', link: '/coding', urgency: 'high',
    }
    if (score < 70) return {
      priority: `Practice ${targetRole} interview questions`,
      reason: 'Technical Q&A practice directly improves placement readiness. Aim for 30 questions daily.',
      impact: '+5–8 readiness points',
      cta: 'Interview Q&A', link: '/interview/questions', urgency: 'medium',
    }
    return {
      priority: 'Simulate a full mock interview',
      reason: 'You are close to placement-ready. Consistent mock practice is the final differentiator.',
      impact: 'Maintain readiness level',
      cta: 'Mock Interview', link: '/interview/mock', urgency: 'low',
    }
  }
  const { priority, reason, impact, cta, link, urgency } = getInsight()
  const urgencyColor = { high: '#ef4444', medium: '#f59e0b', warning: '#f59e0b', low: '#10b981' }[urgency]

  return (
    <div style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.06) 100%)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <span className="ai-dot" />
        <span style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ai-accent)' }}>AI Priority</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 99, background: `${urgencyColor}18`, color: urgencyColor }}>
          {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Recommended' : urgency === 'warning' ? 'Setup needed' : 'Maintain'}
        </span>
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', lineHeight: 1.35 }}>{priority}</h3>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.875rem' }}>{reason}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600, background: 'var(--success-muted)', padding: '0.125rem 0.5rem', borderRadius: 99 }}>
          Expected: {impact}
        </span>
        <Link to={link} className="btn btn-ai btn-sm">{cta} →</Link>
      </div>
    </div>
  )
}

/* ─── Today's Mission ───────────────────────────────────────────────────── */
const MISSIONS = [
  { n: '01', label: 'Solve 5 DSA problems',           time: '25 min', link: '/coding',              color: '#6366f1' },
  { n: '02', label: 'Practice 10 aptitude questions', time: '15 min', link: '/aptitude',             color: '#f59e0b' },
  { n: '03', label: 'Take a mock interview',           time: '20 min', link: '/interview/mock',       color: '#10b981' },
  { n: '04', label: 'Review 5 interview questions',   time: '10 min', link: '/interview/questions',  color: '#38bdf8' },
]

function TodaysMission() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {MISSIONS.map(m => (
        <Link key={m.n} to={m.link} style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            transition: 'var(--transition)', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${m.color}50`; e.currentTarget.style.background = `${m.color}08` }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)' }}
          >
            <span style={{ fontSize: '0.63rem', fontWeight: 800, color: m.color, minWidth: 20, fontVariantNumeric: 'tabular-nums' }}>{m.n}</span>
            <div style={{ width: 3, height: 26, borderRadius: 2, background: m.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>{m.label}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{m.time}</span>
            <span style={{ color: m.color, fontSize: '0.875rem', flexShrink: 0 }}>→</span>
          </div>
        </Link>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.25rem 0', borderTop: '1px solid var(--border)', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total estimated time</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>70 min · ~+4 readiness pts</span>
      </div>
    </div>
  )
}

/* ─── Weak Area Intelligence ────────────────────────────────────────────── */
function WeakAreaPanel({ mockHistory }) {
  // Derive from real mock interview data if available
  const hasData = mockHistory.length > 0

  const skills = hasData ? (() => {
    const avg = (key) => Math.round(mockHistory.reduce((s, m) => s + (m[key] ?? 50), 0) / mockHistory.length)
    return [
      { label: 'Technical',     pct: avg('technicalScore'),     color: '#6366f1' },
      { label: 'Communication', pct: avg('communicationScore'), color: '#f59e0b' },
      { label: 'Grammar',       pct: avg('grammarScore'),       color: '#38bdf8' },
      { label: 'Confidence',    pct: avg('confidenceScore'),    color: '#10b981' },
    ].sort((a, b) => a.pct - b.pct)
  })() : [
    { label: 'Communication', pct: 48, color: '#f59e0b' },
    { label: 'Aptitude',      pct: 55, color: '#ef4444' },
    { label: 'Technical',     pct: 62, color: '#6366f1' },
    { label: 'Confidence',    pct: 68, color: '#38bdf8' },
  ]

  const weakest = skills[0]

  return (
    <div>
      {!hasData && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.875rem', padding: '0.375rem 0.625rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          ⓘ Demo data — take a mock interview to see your real weak areas
        </div>
      )}
      {skills.map((s, i) => <SkillBar key={s.label} label={s.label} pct={s.pct} color={s.color} delay={i * 100} />)}
      <div style={{ marginTop: '0.875rem', padding: '0.625rem 0.75rem', background: `${weakest.color}10`, border: `1px solid ${weakest.color}30`, borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontSize: '0.72rem', color: weakest.color, fontWeight: 700 }}>
          Biggest gap: {weakest.label} ({weakest.pct}%)
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
          Improving this area has the highest impact on your readiness score.
        </span>
      </div>
    </div>
  )
}

/* ─── Recent Activity feed ───────────────────────────────────────────────── */
function ActivityFeed({ mockHistory, resumeHistory, codingHistory }) {
  const items = [
    ...mockHistory.slice(0, 2).map(m => ({
      icon: '🎤', label: `Mock Interview — ${m.technology}`,
      meta: `Technical ${m.technicalScore ?? 0}% · Communication ${m.communicationScore ?? 0}%`,
      time: m.createdAt, color: '#a78bfa',
    })),
    ...resumeHistory.slice(0, 1).map(r => ({
      icon: '📄', label: 'Resume Analysis',
      meta: `${r.matchedSkills?.length ?? 0} skills matched`,
      time: r.createdAt, color: '#38bdf8',
    })),
    ...codingHistory.slice(0, 1).map(c => ({
      icon: '💻', label: `Coding — ${c.topic || c.targetRole || 'Practice'}`,
      meta: `${c.problems?.length ?? 0} problems generated`,
      time: c.createdAt, color: '#10b981',
    })),
  ]
    .filter(i => i.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 4)

  if (!items.length) {
    return (
      <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        No activity yet. Start with a mock interview or resume analysis.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.625rem 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}15`, border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0 }}>
            {item.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{item.meta}</div>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}>
            {new Date(item.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Progress Trend (demo sparkline + real counts) ────────────────────── */
function ProgressTrend({ mockCount, resumeCount, codingCount }) {
  // Demo weekly trend data — clearly labeled
  const trendData = mockCount > 0
    ? [20, 30, 28, 45, 42, 58, 65].map((v, i) => Math.min(100, v + mockCount * 3 + i * 2))
    : [10, 15, 18, 20, 22, 25, 28]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '0.875rem' }}>
        <div style={{ flex: 1 }}>
          <Sparkline data={trendData} color="var(--primary)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
            {trendData[trendData.length - 1]}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 600 }}>
            +{trendData[trendData.length - 1] - trendData[0]} this week
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        <span style={{ flex: 1, textAlign: 'center' }}>Mon</span><span style={{ flex: 1, textAlign: 'center' }}>Tue</span>
        <span style={{ flex: 1, textAlign: 'center' }}>Wed</span><span style={{ flex: 1, textAlign: 'center' }}>Thu</span>
        <span style={{ flex: 1, textAlign: 'center' }}>Fri</span><span style={{ flex: 1, textAlign: 'center' }}>Sat</span>
        <span style={{ flex: 1, textAlign: 'center' }}>Sun</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
        {[
          { v: mockCount,   l: 'Mock Interviews', c: '#a78bfa' },
          { v: resumeCount, l: 'Resume Analyses',  c: '#38bdf8' },
          { v: codingCount, l: 'Coding Sessions',  c: '#10b981' },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.3 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.5rem', textAlign: 'right' }}>
        * Trend chart uses demo data
      </p>
    </div>
  )
}

/* ─── Next Best Action (3 smart CTA cards) ──────────────────────────────── */
function NextActions({ score, mockCount, resumeCount, targetRole }) {
  const actions = [
    {
      show: resumeCount === 0,
      icon: '📄', title: 'Upload Your Resume',
      desc: 'AI matches your skills to job requirements.',
      link: '/resume', color: '#38bdf8',
    },
    {
      show: mockCount === 0,
      icon: '🎤', title: 'First Mock Interview',
      desc: 'Discover your communication strengths.',
      link: '/interview/mock', color: '#a78bfa',
    },
    {
      show: !targetRole,
      icon: '🎯', title: 'Set Target Role',
      desc: 'Unlock personalised preparation plan.',
      link: '/profile', color: '#f59e0b',
    },
    {
      show: score < 50,
      icon: '💻', title: 'Practice DSA',
      desc: 'Highest ROI activity for tech placements.',
      link: '/coding', color: '#6366f1',
    },
    {
      show: score >= 50 && score < 75,
      icon: '⚡', title: 'Interview Q&A',
      desc: 'Practice role-specific tech questions.',
      link: '/interview/questions', color: '#6366f1',
    },
    {
      show: score >= 75,
      icon: '🗺️', title: 'Generate Roadmap',
      desc: 'Get a week-by-week placement plan.',
      link: '/roadmap', color: '#10b981',
    },
  ].filter(a => a.show).slice(0, 3)

  // Always show at least 3 actions
  const fallback = [
    { icon: '🧠', title: 'Aptitude Practice', desc: 'Boost logical & quantitative skills.', link: '/aptitude', color: '#f59e0b' },
    { icon: '💬', title: 'Communication', desc: 'Sharpen verbal & soft skills.', link: '/communication', color: '#10b981' },
    { icon: '📊', title: 'Career Roadmap', desc: 'Plan your placement timeline.', link: '/roadmap', color: '#38bdf8' },
  ]
  const display = actions.length >= 3 ? actions : [...actions, ...fallback].slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {display.map((a, i) => (
        <Link key={i} to={a.link} style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1rem', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${a.color}45`; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${a.color}18`, border: `1px solid ${a.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              {a.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)' }}>{a.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{a.desc}</div>
            </div>
            <span style={{ color: a.color, fontSize: '0.9rem', flexShrink: 0 }}>→</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ─── Journey Strip ─────────────────────────────────────────────────────── */
function JourneyStrip({ score, resumeCount, mockCount }) {
  const steps = [
    { label: 'ASSESS',   done: score > 0 || resumeCount > 0 },
    { label: 'PLAN',     done: resumeCount > 0 },
    { label: 'PRACTICE', done: mockCount > 0 },
    { label: 'SIMULATE', done: mockCount >= 3 },
    { label: 'FEEDBACK', done: mockCount >= 1 },
    { label: 'IMPROVE',  done: score >= 50 },
  ]
  const activeIdx = steps.reduce((acc, s, i) => s.done ? i : acc, -1)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', padding: '0.125rem 0' }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            padding: '0.25rem 0.625rem', borderRadius: 99,
            fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.07em',
            background: s.done ? 'var(--primary-muted)' : i === activeIdx + 1 ? 'var(--bg-elevated)' : 'transparent',
            color: s.done ? 'var(--primary-hover)' : i === activeIdx + 1 ? 'var(--text-secondary)' : 'var(--text-dim)',
            border: `1px solid ${s.done ? 'rgba(99,102,241,0.3)' : i === activeIdx + 1 ? 'var(--border-strong)' : 'transparent'}`,
            transition: 'var(--transition)',
          }}>
            {s.done && <span style={{ marginRight: 3 }}>✓</span>}{s.label}
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 16, height: 1, background: s.done ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s', flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Main Dashboard Page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [mockHistory,   setMockHistory]   = useState([])
  const [resumeHistory, setResumeHistory] = useState([])
  const [codingHistory, setCodingHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      await refreshUser()
      const [mock, resume, coding] = await Promise.allSettled([
        getMockHistory(),
        getResumeHistory(),
        getCodingHistory(),
      ])
      if (mock.status   === 'fulfilled') setMockHistory(mock.value ?? [])
      if (resume.status === 'fulfilled') setResumeHistory(resume.value ?? [])
      if (coding.status === 'fulfilled') setCodingHistory(coding.value ?? [])
    } catch (_) { /* silent — partial data is fine */ }
    finally { setLoading(false) }
  }, [refreshUser])

  useEffect(() => { loadData() }, [loadData])

  const score      = user?.placementReadinessScore ?? 0
  const firstName  = user?.name?.split(' ')[0] ?? 'there'
  const targetRole = user?.targetRole ?? ''
  const mockCount  = mockHistory.length
  const resumeCount = resumeHistory.length
  const codingCount = codingHistory.length

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Skeleton height={180} borderRadius={20} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SkeletonCard lines={4} />
            <SkeletonCard lines={5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SkeletonCard lines={3} />
            <SkeletonCard lines={4} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="anim-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── ZONE 1: HERO — Greeting + Score + Journey ───────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.05) 100%)',
        border: '1px solid rgba(99,102,241,0.14)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* ambient glow */}
        <div style={{ position: 'absolute', top: -60, right: 60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>

          {/* left: text + CTA */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="ai-dot" />
              <span style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                AI Placement OS
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: '0.5rem' }}>
              {greeting()}, {firstName} 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.55 }}>
              {targetRole ? `Preparing for ${targetRole}` : 'Set your target role to personalise your journey'}
              {user?.college ? ` · ${user.college}` : ''}
            </p>

            {/* Journey strip */}
            <JourneyStrip score={score} resumeCount={resumeCount} mockCount={mockCount} />

            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <Link to="/interview/mock" className="btn btn-primary">Start Practice →</Link>
              {!targetRole && <Link to="/profile" className="btn btn-secondary">Set Target Role</Link>}
            </div>
          </div>

          {/* right: score ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <ScoreRing score={score} size={120} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: scoreColor(score) }}>
              {scoreLabel(score)}
            </span>
            <button onClick={loadData} style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', marginTop: -4 }}>
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── ZONE 2: MAIN — asymmetric two-column ────────────────────────── */}
      <div id="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>

        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* AI Priority */}
          <div>
            <SectionLabel>AI Priority · What to do right now</SectionLabel>
            <AIPriority score={score} mockCount={mockCount} resumeCount={resumeCount} targetRole={targetRole} />
          </div>

          {/* Today's Mission */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  Daily Focus
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>Today's Mission</h2>
              </div>
              <span className="badge badge-ai">70 min total</span>
            </div>
            <TodaysMission />
          </div>

          {/* Progress Trend */}
          <div className="card">
            <SectionLabel>Progress Trend · Last 7 days</SectionLabel>
            <ProgressTrend mockCount={mockCount} resumeCount={resumeCount} codingCount={codingCount} />
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Weak Area Intelligence */}
          <div className="card">
            <SectionLabel>Weak Area Intelligence</SectionLabel>
            <WeakAreaPanel mockHistory={mockHistory} />
          </div>

          {/* Next Best Action */}
          <div className="card">
            <SectionLabel>Next Best Actions</SectionLabel>
            <NextActions score={score} mockCount={mockCount} resumeCount={resumeCount} targetRole={targetRole} />
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <span style={{ fontSize: '0.63rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                Recent Activity
              </span>
              {(mockCount + resumeCount + codingCount) > 0 && (
                <span className="badge badge-muted">{mockCount + resumeCount + codingCount} sessions</span>
              )}
            </div>
            <ActivityFeed mockHistory={mockHistory} resumeHistory={resumeHistory} codingHistory={codingHistory} />
          </div>
        </div>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 900px) {
          #dash-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .page-content { padding: 0.875rem !important; }
        }
      `}</style>
    </div>
  )
}
