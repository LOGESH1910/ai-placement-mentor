import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Icon from '../../components/ui/Icon'
import { BrandMark } from '../../components/ui/BrandMark'

const POINTS = [
  ['AI mock interviews', 'Practise with instant, structured feedback on every answer.'],
  ['Coding & aptitude practice', 'Focused problem sets that mirror real placement drives.'],
  ['Personal learning plan', 'A clear roadmap from first lesson to final offer.'],
]

export function AuthIntro({ eyebrow, title, tagline }) {
  return (
    <section className="auth-intro" aria-hidden="true">
      <Link to="/" className="auth-intro-brand">
        <BrandMark size={30} /> AI Placement Mentor
      </Link>
      <div className="auth-intro-copy">
        <p className="label" style={{ color: '#a5b4fc', marginBottom: 12 }}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className="auth-tagline">{tagline}</p>
        <ul className="auth-points">
          {POINTS.map(([b, s]) => (
            <li key={b}>
              <span className="auth-point-check">
                <Icon name="check" size={12} strokeWidth={3} />
              </span>
              <div>
                <b>{b}</b>
                <span>{s}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#818cf8' }}>
        A structured workspace for every stage of your job search.
      </p>
    </section>
  )
}

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  /* Already signed in → straight to the app */
  if (!loading && user) return <Navigate to="/dashboard" replace />

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.password) errs.password = 'Password is required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (fieldErrors[k]) setFieldErrors((fe) => ({ ...fe, [k]: undefined }))
  }

  return (
    <div className="auth-layout anim-fade-in">
      <AuthIntro
        eyebrow="WELCOME BACK"
        title={<>Prepare smarter.<br />Get placement ready.</>}
        tagline="Sign in to continue your preparation and keep your progress on track."
      />

      <main className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <BrandMark size={28} /> AI Placement Mentor
          </div>

          <h2>Sign in</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Continue where you left off.
          </p>

          <ErrorAlert message={error} onDismiss={() => setError('')} />

          <form onSubmit={submit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`form-input${fieldErrors.email ? ' invalid' : ''}`}
                value={form.email}
                onChange={set('email')}
                aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <span className="form-error-text">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <div className="spread">
                <label className="form-label" htmlFor="login-password">Password</label>
                <button type="button" className="text-button" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }} onClick={() => alert('Password reset links are sent by your placement coordinator. Please contact them to reset your password.')}>
                  Forgot password?
                </button>
              </div>
              <div className="pwd-field">
                <input
                  id="login-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`form-input${fieldErrors.password ? ' invalid' : ''}`}
                  value={form.password}
                  onChange={set('password')}
                  aria-invalid={Boolean(fieldErrors.password)}
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldErrors.password && <span className="form-error-text">{fieldErrors.password}</span>}
            </div>

            <label className="checkbox-row">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me on this device
            </label>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || loading}>
              {submitting ? (<><span className="spinner" /> Signing in…</>) : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            New to AI Placement Mentor?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
