import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getResumeHistory } from '../services/resumeService'
import { getMockHistory } from '../services/interviewService'
import { getRoadmapHistory } from '../services/roadmapService'
import Loader from '../components/ui/Loader'

const QUICK_ACTIONS = [
  { to: '/resume',              icon: '📄', label: 'Analyze Resume',    color: '#00d4ff' },
  { to: '/interview/questions', icon: '❓', label: 'Interview Q&A',     color: '#10b981' },
  { to: '/interview/mock',      icon: '🎤', label: 'Mock Interview',    color: '#f59e0b' },
  { to: '/coding',              icon: '💻', label: 'Coding Problems',   color: '#a78bfa' },
  { to: '/roadmap',             icon: '🗺️', label: 'Build Roadmap',     color: '#0ea5e9' },
  { to: '/profile',             icon: '👤', label: 'Update Profile',    color: '#38bdf8' },
]

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [stats, setStats] = useState({ analyses: 0, mocks: 0, roadmaps: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshUser()
    Promise.all([
      getResumeHistory().catch(() => []),
      getMockHistory().catch(() => []),
      getRoadmapHistory().catch(() => []),
    ]).then(([analyses, mocks, roadmaps]) => {
      setStats({ analyses: analyses.length, mocks: mocks.length, roadmaps: roadmaps.length })
    }).finally(() => setLoading(false))
  }, [refreshUser])

  const score = user?.placementReadinessScore ?? 0
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 42
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  if (loading) return <Loader fullPage text="Loading dashboard…" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #060e1c 0%, #071422 60%, #050c18 100%)',
        border: '1px solid rgba(0,212,255,0.2)',
        borderRadius: 'var(--radius)',
        padding: '2rem 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1.5rem',
        boxShadow: '0 0 40px rgba(0,212,255,0.07)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: 180, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
            AI Placement Mentor
          </div>
          <h2 style={{
            fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2,
            background: 'linear-gradient(135deg, #e2f0ff 30%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Welcome back, {firstName} 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            {user?.targetRole ? `Targeting: ${user.targetRole}` : 'Set your target role in Profile for personalized tips'}
          </p>
          {user?.college && (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              🏫 {user.college}{user.department ? ` · ${user.department}` : ''}
            </p>
          )}
        </div>

        {/* Readiness ring */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto' }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="42" fill="none" stroke="#0d1b2e" strokeWidth="8" />
              <circle cx="55" cy="55" r="42" fill="none" stroke={scoreColor} strokeWidth="8"
                strokeDasharray={`${circumference * score / 100} ${circumference * (1 - score / 100)}`}
                strokeDashoffset={circumference * 0.25} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 8px ${scoreColor}99)` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>/ 100</span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Readiness Score
          </p>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid-3">
        {[
          { icon: '📄', label: 'Resume Analyses', value: stats.analyses, color: '#00d4ff' },
          { icon: '🎤', label: 'Mock Interviews',  value: stats.mocks,    color: '#f59e0b' },
          { icon: '🗺️', label: 'Roadmaps Built',   value: stats.roadmaps, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ flexDirection: 'row', gap: '1rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `${s.color}15`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', boxShadow: `0 0 12px ${s.color}20`,
            }}>{s.icon}</div>
            <div>
              <div style={{
                fontSize: '1.7rem', fontWeight: 800,
                background: `linear-gradient(135deg, #e2f0ff, ${s.color})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1,
              }}>{s.value}</div>
              <div className="stat-label" style={{ marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Profile completeness ──────────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Profile Completeness</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: scoreColor, background: `${scoreColor}15`, padding: '0.15rem 0.55rem', borderRadius: '999px', border: `1px solid ${scoreColor}30` }}>
            {score}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${score}%` }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
          {score < 100 ? 'Add skills, set your target role, and upload your resume to increase your readiness score.' : '🎉 Your profile is fully complete!'}
        </p>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────── */}
      <div>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Quick Actions
        </h3>
        <div className="grid-3">
          {QUICK_ACTIONS.map(({ to, icon, label, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', padding: '1.1rem 1.25rem', border: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}50`; e.currentTarget.style.boxShadow = `0 0 20px ${color}18` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{icon}</div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{label}</span>
                <span style={{ marginLeft: 'auto', color: `${color}80`, fontSize: '1rem' }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {score < 60 && (
        <div className="alert alert-info">
          <span>💡</span>
          <span>Tip: Upload your resume, add your skills, and set a target role to boost your readiness score above 60%.</span>
        </div>
      )}
    </div>
  )
}
