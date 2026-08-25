import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BrandMark } from '../components/ui/BrandMark'
import Icon from '../components/ui/Icon'

const FEATURES = [
  {
    icon: 'sparkles', tint: 'var(--primary-muted)', color: 'var(--primary)',
    title: 'AI Placement Mentor',
    desc: 'Ask anything about your preparation — roadmaps, concepts, strategy — and get structured, expert-level guidance instantly.',
  },
  {
    icon: 'code', tint: 'var(--info-muted)', color: 'var(--info)',
    title: 'Coding Practice',
    desc: 'Curated DSA problem sets across arrays, trees, graphs and dynamic programming, tuned to your target role.',
  },
  {
    icon: 'mic', tint: 'var(--violet-muted)', color: 'var(--violet)',
    title: 'Interview Preparation',
    desc: 'Technical and HR question banks plus AI-scored mock interviews with actionable feedback after every attempt.',
  },
  {
    icon: 'target', tint: 'var(--warning-muted)', color: 'var(--warning)',
    title: 'Aptitude Practice',
    desc: 'Quantitative aptitude, logical reasoning and verbal ability questions modelled on real placement papers.',
  },
  {
    icon: 'fileText', tint: 'var(--success-muted)', color: 'var(--success)',
    title: 'Resume Analysis',
    desc: 'AI-powered resume reviews with ATS-style scoring, matched skills and clear gaps to close before applying.',
  },
  {
    icon: 'briefcase', tint: 'var(--primary-muted)', color: 'var(--primary)',
    title: 'Career Roadmap',
    desc: 'A personalised week-by-week plan from where you are today to interview-ready for your target role.',
  },
  {
    icon: 'chart', tint: 'var(--info-muted)', color: 'var(--info)',
    title: 'Progress Tracking',
    desc: 'Placement readiness scoring, weekly activity trends and skill-level insights that show exactly what to improve.',
  },
  {
    icon: 'book', tint: 'var(--violet-muted)', color: 'var(--violet)',
    title: 'Placement Resources',
    desc: 'Structured lessons on Java, Python, DSA, DBMS, OS and networks — with examples and practice in every topic.',
  },
]

const STEPS = [
  { n: '1', title: 'Create your account', desc: 'Sign up free and tell us about your education, skills and target role.' },
  { n: '2', title: 'Complete your profile', desc: 'Add your resume so the AI can map your strengths and skill gaps.' },
  { n: '3', title: 'Practice and learn', desc: 'Follow structured lessons, solve problems and take AI mock interviews.' },
  { n: '4', title: 'Track placement progress', desc: 'Watch your readiness score rise with clear guidance on what to do next.' },
]

const FOOTER_COLS = [
  {
    heading: 'Product',
    links: [
      ['Features', '#features'],
      ['How it works', '#how-it-works'],
      ['Learn', '/learn'],
      ['Practice', '/practice'],
    ],
  },
  {
    heading: 'Resources',
    links: [
      ['Interview prep', '/interview'],
      ['AI Mentor', '/ai-mentor'],
      ['Resume analysis', '/resume'],
      ['Progress tracking', '/progress'],
    ],
  },
  {
    heading: 'Company',
    links: [['About', '#how-it-works'], ['Careers', '#'], ['Blog', '#']],
  },
  {
    heading: 'Support',
    links: [['Help center', '#'], ['Contact us', '#'], ['Privacy policy', '#'], ['Terms of service', '#']],
  },
]

function LandingHeader() {
  const { user } = useAuth()
  const authed = Boolean(user)
  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="topnav-brand">
          <BrandMark />
          AI Placement Mentor
        </Link>
        <nav className="landing-links" aria-label="Landing">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">About</a>
          {authed ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
                Sign up
              </Link>
            </>
          )}
        </nav>
        {/* Mobile compact actions */}
        <div className="landing-mobile-actions" style={{ marginLeft: 'auto', display: 'none', gap: 8 }}>
          {authed ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default function LandingPage() {
  return (
    <div className="anim-fade-in">
      <LandingHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-container">
          <span className="landing-eyebrow">
            <Icon name="sparkles" size={13} /> AI-powered placement preparation
          </span>
          <h1 className="display">
            Your AI-Powered<br />
            <span style={{ color: 'var(--primary)' }}>Placement Preparation</span> Platform
          </h1>
          <p className="hero-sub">
            Prepare for coding interviews, technical rounds, aptitude tests and HR interviews —
            all in one workspace. Get a personalised study plan, practise with purpose and walk
            into every interview with confidence.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="btn btn-primary btn-xl">
              Start Preparing <Icon name="arrowRight" size={16} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-xl">Explore Features</a>
          </div>

          <div className="hero-meta" aria-label="Platform statistics">
            <div className="hero-meta-item"><b>14+</b><span>Learning tracks</span></div>
            <div className="hero-meta-item"><b>500+</b><span>Practice questions</span></div>
            <div className="hero-meta-item"><b>4</b><span>Mock interview modes</span></div>
            <div className="hero-meta-item"><b>100%</b><span>Free to start</span></div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <span className="landing-eyebrow">Everything you need</span>
          <h2 className="h1" style={{ marginTop: '1rem' }}>
            One platform for every stage of placement season
          </h2>
          <p className="body-lg" style={{ maxWidth: 620, marginTop: '0.75rem' }}>
            From learning core concepts to simulating final-round interviews, each tool is
            designed around how recruiters actually evaluate candidates.
          </p>

          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.tint, color: f.color }}>
                  <Icon name={f.icon} size={20} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        className="landing-section"
        id="how-it-works"
        style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
      >
        <div className="landing-container">
          <span className="landing-eyebrow">Simple by design</span>
          <h2 className="h1" style={{ marginTop: '1rem' }}>How it works</h2>
          <p className="body-lg" style={{ maxWidth: 560, marginTop: '0.75rem' }}>
            Four steps between you and a structured, measurable preparation plan.
          </p>

          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / FAQ strip ────────────────────────────────────────────── */}
      <section className="landing-section" id="faq">
        <div className="landing-container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div>
              <span className="landing-eyebrow">Why AI Placement Mentor</span>
              <h2 className="h1" style={{ marginTop: '1rem' }}>
                Built like a mentor, not another question bank
              </h2>
              <p className="body-lg" style={{ marginTop: '1rem' }}>
                Most students fail placements not because they lack ability, but because they
                prepare without direction. This platform measures your readiness across coding,
                aptitude, technical depth and communication — then tells you exactly what to
                work on next.
              </p>
              <ul style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Personalised readiness score updated as you practise',
                  'AI feedback on every mock interview answer',
                  'Structured learning tracks written for interviews',
                  'Works on desktop, tablet and mobile',
                ].map((point) => (
                  <li key={point} className="row" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      background: 'var(--success-muted)', color: 'var(--success)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name="check" size={12} strokeWidth={2.5} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card card-pad" aria-hidden="true">
              <div className="spread" style={{ marginBottom: '1rem' }}>
                <span className="label">Weekly readiness snapshot</span>
                <span className="badge badge-success">+12% this week</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  ['Coding', 72, 'var(--primary)'],
                  ['Aptitude', 64, 'var(--info)'],
                  ['Technical interview', 58, 'var(--violet)'],
                  ['Communication', 81, 'var(--success)'],
                ].map(([label, pct, color]) => (
                  <div key={label}>
                    <div className="spread caption" style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{label}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="alert alert-info" style={{ marginTop: '1.25rem', alignItems: 'center' }}>
                <Icon name="sparkles" size={15} />
                <span>Focus next: graph traversal patterns — 3 problems queued.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="landing-container" style={{ paddingBottom: '2rem' }}>
        <div className="cta-banner">
          <h2>Ready to get placement-ready?</h2>
          <p>
            Join thousands of students preparing smarter. Create your free account and get your
            personalised study plan in under two minutes.
          </p>
          <div className="hero-ctas">
            <Link to="/register" className="btn btn-xl btn-white">
              Start Preparing — It&apos;s Free <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <span className="row" style={{ fontWeight: 800, gap: 10 }}>
              <BrandMark size={26} /> AI Placement Mentor
            </span>
            <p className="footer-brand-blurb">
              The AI-powered platform that takes engineering students from first lesson to final
              offer with structured practice and measurable progress.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div className="footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link to={href}>{label}</Link>
                    ) : (
                      <a href={href}>{label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AI Placement Mentor. All rights reserved.</span>
          <span>Built for aspiring engineers.</span>
        </div>
      </footer>
    </div>
  )
}
