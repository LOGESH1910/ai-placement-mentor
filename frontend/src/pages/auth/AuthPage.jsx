import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

/* ─── Constants ──────────────────────────────────────────────────────────── */
const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
const PHONE_RE = /^[6-9]\d{9}$/
const PWD_RULES = [
  { id: 'len',     label: 'At least 8 characters',        test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A–Z)',    test: p => /[A-Z]/.test(p) },
  { id: 'special', label: 'One special character (!@#$)',  test: p => /[!@#$%^&*]/.test(p) },
  { id: 'number',  label: 'One number (0–9)',              test: p => /\d/.test(p) },
]

const SLIDES = [
  {
    tag: 'AI Mentor',
    headline: 'Your AI mentor for\nplacement success.',
    sub: 'Personalised preparation based on your skills, goals and real performance data.',
    accent: '#818cf8',
    bg: 'radial-gradient(ellipse at 60% 40%, rgba(99,102,241,0.18) 0%, transparent 60%), linear-gradient(160deg, #080c14 0%, #0d1220 100%)',
    stats: [
      { v: '92%', l: 'Avg Placement Rate' },
      { v: '500+', l: 'Practice Questions' },
      { v: '10×', l: 'Faster Preparation' },
    ],
  },
  {
    tag: 'AI Interview',
    headline: 'Practice before\nthe real interview.',
    sub: 'Simulate technical, HR and behavioural interviews with real-time AI scoring.',
    accent: '#34d399',
    bg: 'radial-gradient(ellipse at 60% 40%, rgba(16,185,129,0.15) 0%, transparent 60%), linear-gradient(160deg, #080c14 0%, #0d1220 100%)',
    stats: [
      { v: '85%', l: 'Score Improvement' },
      { v: 'Real-time', l: 'AI Feedback' },
      { v: '24/7', l: 'Available' },
    ],
  },
  {
    tag: 'Readiness Analytics',
    headline: 'Know exactly\nwhere you stand.',
    sub: 'Track your readiness score, identify weak areas and improve with data-driven guidance.',
    accent: '#38bdf8',
    bg: 'radial-gradient(ellipse at 60% 40%, rgba(56,189,248,0.15) 0%, transparent 60%), linear-gradient(160deg, #080c14 0%, #0d1220 100%)',
    stats: [
      { v: 'Live', l: 'Score Tracking' },
      { v: 'AI', l: 'Weak Area Detection' },
      { v: '3 min', l: 'To Get Started' },
    ],
  },
]

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function PwdStrength({ pw }) {
  if (!pw) return null
  const passed = PWD_RULES.filter(r => r.test(pw)).length
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const c = colors[passed - 1] || '#ef4444'
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {PWD_RULES.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < passed ? c : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
        ))}
      </div>
      {passed > 0 && (
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c }}>{labels[passed - 1]}</span>
      )}
      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {PWD_RULES.map(r => {
          const ok = r.test(pw)
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {ok
                ? <CheckCircle2 size={10} color="#10b981" />
                : <XCircle size={10} color="rgba(255,255,255,0.2)" />}
              <span style={{ fontSize: '0.68rem', color: ok ? '#10b981' : 'rgba(255,255,255,0.35)' }}>
                {r.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.03em' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '0.71rem', color: '#f87171' }}>{error}</span>}
    </div>
  )
}

const inputStyle = (hasError) => ({
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: 'var(--radius-sm)',
  padding: '0.5625rem 0.875rem',
  color: 'var(--text)',
  fontSize: '0.875rem',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
})

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [tab, setTab]         = useState(mode)
  const [loading, setLoading] = useState(false)
  const [serverErr, setServerErr] = useState('')
  const [slide, setSlide]     = useState(0)
  const [paused, setPaused]   = useState(false)
  const intervalRef = useRef(null)

  /* form state */
  const [lf, setLf] = useState({ email: '', password: '' })
  const [le, setLe] = useState({})
  const [rf, setRf] = useState({ name: '', email: '', phone: '', password: '', confirm: '', college: '', department: '' })
  const [re, setRe] = useState({})
  const [showLP, setShowLP] = useState(false)
  const [showRP, setShowRP] = useState(false)
  const [showCP, setShowCP] = useState(false)
  const [remember, setRemember] = useState(false)

  /* carousel */
  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 6000)
    return () => clearInterval(intervalRef.current)
  }, [paused])

  useEffect(() => {
    const onVisibilityChange = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => { setServerErr(''); setLe({}); setRe({}) }, [tab])

  /* validation */
  const valLogin = () => {
    const e = {}
    if (!GMAIL_RE.test(lf.email))  e.email    = 'Enter a valid @gmail.com address'
    if (!lf.password)              e.password = 'Password is required'
    return e
  }

  const valReg = () => {
    const e = {}
    if (!rf.name.trim())                  e.name    = 'Full name is required'
    if (!GMAIL_RE.test(rf.email))         e.email   = 'Enter a valid @gmail.com address'
    if (!PHONE_RE.test(rf.phone))         e.phone   = 'Enter a valid 10-digit mobile number'
    const fail = PWD_RULES.filter(r => !r.test(rf.password))
    if (fail.length)                      e.password = fail.map(r => r.label).join(' · ')
    if (rf.password !== rf.confirm)       e.confirm  = 'Passwords do not match'
    return e
  }

  const submitLogin = async (e) => {
    e.preventDefault()
    const errs = valLogin()
    if (Object.keys(errs).length) { setLe(errs); return }
    setLoading(true); setServerErr('')
    try { await login(lf.email, lf.password); navigate('/dashboard') }
    catch (err) { setServerErr(err.message || 'Invalid credentials. Please try again.') }
    finally { setLoading(false) }
  }

  const submitReg = async (e) => {
    e.preventDefault()
    const errs = valReg()
    if (Object.keys(errs).length) { setRe(errs); return }
    setLoading(true); setServerErr('')
    try {
      await register({ name: rf.name, email: rf.email, password: rf.password, college: rf.college, department: rf.department })
      navigate('/dashboard')
    }
    catch (err) { setServerErr(err.message || 'Registration failed. Please try again.') }
    finally { setLoading(false) }
  }

  const s = SLIDES[slide]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080c14', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── LEFT visual panel (hidden on mobile) ── */}
      <div
        style={{ flex: '0 0 58%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        aria-hidden="true"
      >
        {/* animated bg */}
        <AnimatePresence mode="wait">
          <motion.div key={slide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            style={{ position: 'absolute', inset: 0, background: s.bg }}
          >
            {/* grid texture */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '28px 28px', pointerEvents: 'none',
            }} />
            {/* accent glow */}
            <div style={{
              position: 'absolute', top: '-15%', right: '-5%',
              width: 480, height: 480, borderRadius: '50%',
              background: `radial-gradient(circle, ${s.accent}20 0%, transparent 65%)`,
              pointerEvents: 'none',
            }} />
          </motion.div>
        </AnimatePresence>

        {/* brand */}
        <div style={{ position: 'relative', zIndex: 10, padding: '2rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: '#fff', boxShadow: '0 0 20px rgba(99,102,241,0.4)', flexShrink: 0 }}>A</div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', letterSpacing: '0.04em' }}>AI Placement Mentor</span>
        </div>

        {/* content */}
        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 2.5rem 2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div key={`c-${slide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* tag */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.25rem 0.75rem', borderRadius: 99, background: 'rgba(255,255,255,0.06)', border: `1px solid ${s.accent}35`, marginBottom: '1.5rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.accent, boxShadow: `0 0 6px ${s.accent}` }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: s.accent, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{s.tag}</span>
              </div>

              {/* headline */}
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.18, letterSpacing: '-0.025em', maxWidth: 460, marginBottom: '1.125rem', whiteSpace: 'pre-line' }}>{s.headline}</h1>

              {/* sub */}
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 400, marginBottom: '2.5rem' }}>{s.sub}</p>

              {/* stats */}
              <div style={{ display: 'flex', gap: '2.25rem' }}>
                {s.stats.map(st => (
                  <div key={st.l}>
                    <div style={{ fontSize: '1.625rem', fontWeight: 800, color: s.accent, lineHeight: 1, letterSpacing: '-0.02em' }}>{st.v}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 500 }}>{st.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* carousel controls */}
        <div style={{ position: 'relative', zIndex: 10, padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => { setSlide(i); setPaused(true); setTimeout(() => setPaused(false), 8000) }}
              aria-label={`Slide ${i + 1}`}
              style={{ width: i === slide ? 22 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === slide ? s.accent : 'rgba(255,255,255,0.18)', transition: 'all 0.3s ease', padding: 0, outline: 'none' }} />
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', fontVariantNumeric: 'tabular-nums' }}>
            0{slide + 1} / 0{SLIDES.length}
          </span>
        </div>
      </div>

      {/* ── RIGHT auth panel ── */}
      <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', background: 'var(--bg-card)', borderLeft: '1px solid rgba(255,255,255,0.07)', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: '#fff', margin: '0 auto 1rem', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}>A</div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.015em', marginBottom: '0.375rem' }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {tab === 'login' ? 'Sign in to continue your preparation' : 'Start your placement journey today'}
            </p>
          </div>

          {/* tab switcher */}
          <div className="tabs" style={{ marginBottom: '1.5rem' }}>
            <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Create Account</button>
          </div>

          {/* server error */}
          {serverErr && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span style={{ flex: 1 }}>⚠ {serverErr}</span>
              <button onClick={() => setServerErr('')} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.875rem', padding: 0, lineHeight: 1 }}>✕</button>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={submitLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Gmail address" error={le.email}>
                <input type="email" placeholder="you@gmail.com" autoComplete="email"
                  value={lf.email} onChange={e => setLf(p => ({ ...p, email: e.target.value }))}
                  style={inputStyle(le.email)}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                  onBlur={e => { e.target.style.borderColor = le.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
              </Field>

              <Field label="Password" error={le.password}>
                <div style={{ position: 'relative' }}>
                  <input type={showLP ? 'text' : 'password'} placeholder="Your password" autoComplete="current-password"
                    value={lf.password} onChange={e => setLf(p => ({ ...p, password: e.target.value }))}
                    style={{ ...inputStyle(le.password), paddingRight: '2.75rem' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                    onBlur={e => { e.target.style.borderColor = le.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                  <button type="button" onClick={() => setShowLP(!showLP)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    {showLP ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: 14, height: 14 }} />
                  Remember me
                </label>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign In →'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <button type="button" className="btn btn-secondary" style={{ width: '100%', gap: 8 }}>
                <GoogleIcon />
                Continue with Google
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                No account?{' '}
                <button type="button" onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                  Create one →
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={submitReg} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="Full name" error={re.name}>
                  <input type="text" placeholder="Your name" autoComplete="name"
                    value={rf.name} onChange={e => setRf(p => ({ ...p, name: e.target.value }))}
                    style={inputStyle(re.name)}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                    onBlur={e => { e.target.style.borderColor = re.name ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                </Field>
                <Field label="Gmail address" error={re.email}>
                  <input type="email" placeholder="you@gmail.com" autoComplete="email"
                    value={rf.email} onChange={e => setRf(p => ({ ...p, email: e.target.value }))}
                    style={inputStyle(re.email)}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                    onBlur={e => { e.target.style.borderColor = re.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                </Field>
              </div>

              <Field label="Phone number" error={re.phone}>
                <input type="tel" placeholder="10-digit mobile number" autoComplete="tel"
                  value={rf.phone} onChange={e => setRf(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  style={inputStyle(re.phone)}
                  onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                  onBlur={e => { e.target.style.borderColor = re.phone ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
              </Field>

              <Field label="Password" error={re.password}>
                <div style={{ position: 'relative' }}>
                  <input type={showRP ? 'text' : 'password'} placeholder="Create a strong password" autoComplete="new-password"
                    value={rf.password} onChange={e => setRf(p => ({ ...p, password: e.target.value }))}
                    style={{ ...inputStyle(re.password), paddingRight: '2.75rem' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                    onBlur={e => { e.target.style.borderColor = re.password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                  <button type="button" onClick={() => setShowRP(!showRP)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    {showRP ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PwdStrength pw={rf.password} />
              </Field>

              <Field label="Confirm password" error={re.confirm}>
                <div style={{ position: 'relative' }}>
                  <input type={showCP ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password"
                    value={rf.confirm} onChange={e => setRf(p => ({ ...p, confirm: e.target.value }))}
                    style={{ ...inputStyle(re.confirm), paddingRight: '2.75rem' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                    onBlur={e => { e.target.style.borderColor = re.confirm ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                  <button type="button" onClick={() => setShowCP(!showCP)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                    {showCP ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Field label="College (optional)">
                  <input type="text" placeholder="University name"
                    value={rf.college} onChange={e => setRf(p => ({ ...p, college: e.target.value }))}
                    style={inputStyle(false)}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                </Field>
                <Field label="Department (optional)">
                  <input type="text" placeholder="CSE / IT / ECE"
                    value={rf.department} onChange={e => setRf(p => ({ ...p, department: e.target.value }))}
                    style={inputStyle(false)}
                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-muted)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                </Field>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.25rem' }}>
                {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create Account →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                  Sign in →
                </button>
              </p>
            </form>
          )}

        </div>
      </div>

      {/* mobile responsive override */}
      <style>{`
        @media (max-width: 768px) {
          [data-auth-root] { flex-direction: column; }
          [data-auth-visual] { flex: 0 0 200px !important; }
          [data-auth-form] { flex: 1 !important; padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
