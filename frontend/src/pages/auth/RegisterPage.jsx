import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorAlert from '../../components/ui/ErrorAlert'
import { BrandMark } from '../../components/ui/BrandMark'
import { AuthIntro } from './LoginPage'

function passwordStrength(pwd) {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 6) score += 1
  if (pwd.length >= 10 && /[A-Z]/.test(pwd)) score += 1
  if (/[^A-Za-z0-9]/.test(pwd) || /\d/.test(pwd)) score += 1
  return Math.min(score, 3)
}

const STRENGTH_LABEL = ['', 'Weak password', 'Decent password', 'Strong password']

export default function RegisterPage() {
  const { user, loading, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', college: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [agree, setAgree] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const strength = useMemo(() => passwordStrength(form.password), [form.password])

  if (!loading && user) return <Navigate to="/dashboard" replace />

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    else if (form.name.trim().length < 2) errs.name = 'Enter your full name'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Use at least 6 characters'
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match'
    if (!agree) errs.agree = 'Please accept the Terms to continue'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        college: form.college.trim(),
      })
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
        eyebrow="YOUR PLACEMENT WORKSPACE"
        title={<>A clearer path<br />to your next role.</>}
        tagline="Create your plan, practise with intent and see exactly where to focus next."
      />

      <main className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <BrandMark size={28} /> AI Placement Mentor
          </div>

          <h2>Create your account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Free forever. Set up in under a minute.
          </p>

          <ErrorAlert message={error} onDismiss={() => setError('')} />

          <form onSubmit={submit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name" name="name" autoComplete="name" placeholder="Your full name"
                className={`form-input${fieldErrors.name ? ' invalid' : ''}`}
                value={form.name} onChange={set('name')} aria-invalid={Boolean(fieldErrors.name)}
              />
              {fieldErrors.name && <span className="form-error-text">{fieldErrors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
                className={`form-input${fieldErrors.email ? ' invalid' : ''}`}
                value={form.email} onChange={set('email')} aria-invalid={Boolean(fieldErrors.email)}
              />
              {fieldErrors.email && <span className="form-error-text">{fieldErrors.email}</span>}
            </div>

            <div className="grid grid-2" style={{ gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="pwd-field">
                  <input
                    id="reg-password" name="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password" placeholder="Min. 6 characters"
                    className={`form-input${fieldErrors.password ? ' invalid' : ''}`}
                    value={form.password} onChange={set('password')}
                    aria-invalid={Boolean(fieldErrors.password)}
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Hide password' : 'Show password'}>
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
                <input
                  id="reg-confirm" name="confirm" type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password" placeholder="Repeat password"
                  className={`form-input${fieldErrors.confirm ? ' invalid' : ''}`}
                  value={form.confirm} onChange={set('confirm')}
                  aria-invalid={Boolean(fieldErrors.confirm)}
                />
              </div>
            </div>

            {/* Strength indicator */}
            {form.password && (
              <div aria-live="polite">
                <div className="strength-track">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className={`strength-seg${strength >= i ? ` on-${strength}` : ''}`} />
                  ))}
                </div>
                <span className="caption" style={{ marginTop: 4, display: 'block', color: strength === 3 ? 'var(--success)' : strength === 2 ? 'var(--warning)' : 'var(--danger)' }}>
                  {STRENGTH_LABEL[strength]}
                </span>
              </div>
            )}
            {(fieldErrors.password || fieldErrors.confirm) && (
              <span className="form-error-text">{fieldErrors.password ?? fieldErrors.confirm}</span>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="reg-college">
                College <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(optional)</span>
              </label>
              <input id="reg-college" name="college" placeholder="e.g. Anna University" value={form.college} onChange={set('college')} />
            </div>

            <div>
              <label className="checkbox-row">
                <input
                  type="checkbox" checked={agree}
                  onChange={(e) => { setAgree(e.target.checked); if (fieldErrors.agree) setFieldErrors((f) => ({ ...f, agree: undefined })) }}
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
              {fieldErrors.agree && <span className="form-error-text" style={{ marginTop: 4 }}>{fieldErrors.agree}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || loading}>
              {submitting ? (<><span className="spinner" /> Creating account…</>) : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
