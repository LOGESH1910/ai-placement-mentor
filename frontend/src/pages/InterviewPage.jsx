import { Suspense, lazy, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'
import { HR_QUESTIONS, MOCK_MODES } from '../data/hrData'

/* Existing AI-powered pages load lazily inside the hub */
const InterviewQuestionsPage = lazy(() => import('./InterviewQuestionsPage'))
const MockInterviewPage = lazy(() => import('./MockInterviewPage'))

const TECH_TOPICS = [
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'dsa', label: 'DSA', icon: '🧱' },
  { id: 'dbms', label: 'DBMS', icon: '💾' },
  { id: 'os', label: 'Operating Systems', icon: '🖥️' },
  { id: 'cn', label: 'Computer Networks', icon: '🌐' },
  { id: 'oop', label: 'OOP', icon: '🧩' },
]

function TabLoading() {
  return (
    <div className="flex-col" style={{ gap: 12 }} aria-busy="true">
      <div className="skeleton" style={{ height: 90 }} />
      <div className="skeleton" style={{ height: 220 }} />
      <div className="skeleton" style={{ height: 160 }} />
    </div>
  )
}

/* ── Technical tab ───────────────────────────────────────────────────────── */
function TechnicalTab() {
  return (
    <div className="flex-col" style={{ gap: '1.25rem' }}>
      <div className="card card-pad">
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>Core interview subjects</h3>
        <p className="caption" style={{ marginBottom: '1rem' }}>
          Pick a subject to study its learning track — each includes lessons, examples and key points.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.6rem' }}>
          {TECH_TOPICS.map((t) => (
            <Link key={t.id} to={`/learn/${t.id}`} className="interview-topic-card">
              <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: '0.86rem' }}>{t.label}</span>
              <Icon name="arrowRight" size={14} />
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontWeight: 700, margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={16} /> AI question generator
          <span className="badge badge-primary">Personalised</span>
        </h3>
        <Suspense fallback={<TabLoading />}>
          <InterviewQuestionsPage />
        </Suspense>
      </div>
    </div>
  )
}

/* ── HR tab ──────────────────────────────────────────────────────────────── */
function HRTab() {
  return (
    <div className="flex-col" style={{ gap: '1rem' }}>
      <div className="alert alert-info">
        <Icon name="info" size={15} />
        <span>
          Structure beats memorisation — learn the framework for each answer, then practise it aloud
          in an <Link to="/ai-mentor" style={{ fontWeight: 700 }}>AI mock HR round</Link>.
        </span>
      </div>

      {HR_QUESTIONS.map((item) => (
        <details key={item.id} className="hr-question">
          <summary>
            <span className="tile-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)', width: 32, height: 32, borderRadius: 9 }}>
              <Icon name="mic" size={15} />
            </span>
            <span style={{ flex: 1 }}>{item.q}</span>
            <span className="badge badge-neutral">{item.tag}</span>
            <Icon name="chevronDown" size={15} />
          </summary>
          <div className="hr-answer flex-col" style={{ gap: '0.9rem' }}>
            <div>
              <span className="label" style={{ color: 'var(--primary)' }}>Answer framework</span>
              <p style={{ marginTop: 4 }}>{item.framework}</p>
            </div>
            <div>
              <span className="label">Model answer</span>
              <p style={{
                marginTop: 4, background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '0.85rem 1rem', whiteSpace: 'pre-line', lineHeight: 1.7,
              }}>
                {item.answer}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              <div>
                <span className="label" style={{ color: 'var(--success)' }}>Do</span>
                <ul style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {item.tips.map((t, i) => (
                    <li key={i} className="small row" style={{ gap: 7 }}>
                      <span style={{ color: 'var(--success)' }}><Icon name="check" size={12} strokeWidth={2.5} /></span> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="label" style={{ color: 'var(--danger)' }}>Avoid</span>
                <ul style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {item.pitfalls.map((t, i) => (
                    <li key={i} className="small row" style={{ gap: 7 }}>
                      <span style={{ color: 'var(--danger)' }}><Icon name="x" size={12} strokeWidth={2.5} /></span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  )
}

/* ── Mock tab ────────────────────────────────────────────────────────────── */
function MockTab() {
  const [showSimulator, setShowSimulator] = useState(false)

  if (showSimulator) {
    return (
      <div className="flex-col" style={{ gap: '1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowSimulator(false)} style={{ alignSelf: 'flex-start' }}>
          <Icon name="arrowLeft" size={14} /> Back to modes
        </button>
        <Suspense fallback={<TabLoading />}>
          <MockInterviewPage />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="flex-col" style={{ gap: '1rem' }}>
      {MOCK_MODES.map((m) => (
        <article key={m.id} className="q-card spread" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="row" style={{ gap: '1rem' }}>
            <span className="tile-icon" style={{ background: `${m.color}14`, width: 44, height: 44, fontSize: '1.3rem' }}>
              {m.icon}
            </span>
            <div style={{ maxWidth: 520 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.label}</h3>
              <p className="caption" style={{ marginTop: 3, lineHeight: 1.6 }}>{m.desc}</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSimulator(true)}>
            <Icon name="play" size={13} /> Start session
          </button>
        </article>
      ))}

      {/* Live communication practice */}
      <article className="q-card spread" style={{ flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(120deg, var(--primary-muted), transparent 70%)' }}>
        <div className="row" style={{ gap: '1rem' }}>
          <span className="tile-icon" style={{ background: 'var(--success-muted)', width: 44, height: 44, fontSize: '1.3rem' }}>
            🗣️
          </span>
          <div style={{ maxWidth: 520 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Live Communication Practice</h3>
            <p className="caption" style={{ marginTop: 3, lineHeight: 1.6 }}>
              Interactive sessions with voice — self introduction, HR rounds, group discussion and impromptu speaking.
            </p>
          </div>
        </div>
        <Link to="/communication" className="btn btn-secondary">
          Open trainer <Icon name="arrowRight" size={13} />
        </Link>
      </article>

      <div className="alert alert-info">
        <Icon name="sparkles" size={15} />
        <span>
          After each answer the AI scores technical depth, communication and confidence — review
          feedback on the <Link to="/progress" style={{ fontWeight: 700 }}>Progress page</Link>.
        </span>
      </div>
    </div>
  )
}

/* ── Hub page ────────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'technical', label: 'Technical Interview', icon: 'code' },
  { id: 'hr', label: 'HR Interview', icon: 'user' },
  { id: 'mock', label: 'Mock Interview', icon: 'mic' },
]

export default function InterviewPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'technical'

  return (
    <div className="anim-slide-up">
      <PageHeader
        icon="mic"
        title="Interview Preparation"
        subtitle="Technical rounds, HR questions and AI-scored mock interviews — one place."
      />

      <div className="tabs-bar" role="tablist" aria-label="Interview preparation sections" style={{ marginBottom: '1.25rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab-item${tab === t.id ? ' active' : ''}`}
            onClick={() => setParams({ tab: t.id }, { replace: true })}
          >
            <span className="row" style={{ gap: 7 }}>
              <Icon name={t.icon} size={14} /> {t.label}
            </span>
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
        {tab === 'technical' && <TechnicalTab />}
        {tab === 'hr' && <HRTab />}
        {tab === 'mock' && <MockTab />}
      </div>
    </div>
  )
}
