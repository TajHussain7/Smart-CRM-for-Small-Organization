import { useState, useEffect } from 'react'
import './App.css'
import SchoolWorkspace from './dashboard/SchoolWorkspace'
import { saveWorkspace } from './workspace-store'
import { saveAccount } from './account-store'
import { login, register, logout } from './api/auth.js'
import {
  useAuth,
  setAuthSession,
  setAuthLoading,
  setAuthError,
  clearAuthSession,
} from './auth-store.js'

// ─── SVG icon paths ───────────────────────────────────────────────────────────
const paths = {
  mail: 'M3 5h18v14H3z M3 6l9 7 9-7',
  lock: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
  user: 'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-3c0-5 16-5 16 0v3z',
  store: 'M3 3h18 M4 6h16l2 5H2z M4 11v10h16V11 M8 21v-7h8',
  type: 'M12 2l4 7H8z M3 14h7v7H3z M21 17.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
  arrow: 'M4 12h16 M13 5l7 7-7 7',
  back: 'M20 12H4 M11 5l-7 7 7 7',
  rocket:
    'M9 15l-4-4C9 4 14 2 22 2c0 8-2 13-9 17l-4-4z M9 15l-3 3 M5 15c-3 1-3 6-3 7 1 0 6 0 7-3 M14 7l3 3 M5 11H2l3-6 5-1 M13 19v3l6-3 1-5',
}

function Icon({ name, size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}

function Field({ label, icon, children, ...props }) {
  return (
    <div className="field">
      <label htmlFor={props.id}>{label}</label>
      <div className="input-wrap">
        <Icon name={icon} />
        {children || <input {...props} required />}
      </div>
    </div>
  )
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 18,
        height: 18,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        marginLeft: 8,
        verticalAlign: 'middle',
      }}
      aria-hidden="true"
    />
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, isLoading, error } = useAuth()
  const [route, setRoute] = useState(location.hash || '#login')
  const [notice, setNotice] = useState('')

  // Update route on hash change
  useEffect(() => {
    const update = () => {
      setRoute(location.hash || '#login')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  // If the user is authenticated and on login/create-workspace, redirect to dashboard
  useEffect(() => {
    if (
      isAuthenticated &&
      (route === '#login' || route === '' || route === '#create-workspace')
    ) {
      location.hash = '#school-dashboard'
    }
  }, [isAuthenticated, route])

  const isWorkspacePage = route === '#create-workspace'

  // ─── Form submit handler ──────────────────────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setAuthError(null)
    setAuthLoading(true)

    const form = event.currentTarget
    const email = form.querySelector('#email')?.value?.trim() || ''
    const password = form.querySelector('#password')?.value || ''

    try {
      if (isWorkspacePage) {
        // ── Registration ───────────────────────────────────────────────────
        const name = form.querySelector('#owner')?.value?.trim() || ''
        const businessName = form.querySelector('#business')?.value?.trim() || ''

        if (!businessName) {
          setAuthLoading(false)
          setNotice('Please enter your school / organization name.')
          return
        }

        const data = await register({
          name,
          email,
          password,
          businessName,
          schoolEnabled: true,
          gymEnabled: true,
          barberEnabled: true,
        })

        // Sync local stores with backend response
        saveAccount({ name: data.user.name, email: data.user.email, phone: '', address: '', bio: '', photo: '' })
        saveWorkspace(data.workspace.name)
        setAuthSession(data.user, data.workspace)
        location.hash = '#school-dashboard'
      } else {
        // ── Login ──────────────────────────────────────────────────────────
        const { user, workspace } = await login({ email, password })

        saveAccount({ name: user.name, email: user.email, phone: '', address: '', bio: '', photo: '' })
        saveWorkspace(workspace?.name || 'My Workspace')
        setAuthSession(user, workspace)
        location.hash = '#school-dashboard'
      }
    } catch (err) {
      setAuthLoading(false)
      setAuthError(err.message || 'Something went wrong. Please try again.')
    }
  }

  // ─── Route-based rendering ────────────────────────────────────────────────
  const handleLogout = () => {
    clearAuthSession()
    logout()
  }

  if (isAuthenticated) {
    if (route.startsWith('#school-') || route === '#students' || route.startsWith('#student/')) {
      return <SchoolWorkspace route={route} onLogout={handleLogout} />
    }
    if (route.startsWith('#barber-')) {
      return <SchoolWorkspace route={route} onLogout={handleLogout} />
    }
    if (route.startsWith('#gym-')) {
      return <SchoolWorkspace route={route} onLogout={handleLogout} />
    }
  }

  // ─── Auth Shell (Login / Workspace Setup) ─────────────────────────────────
  return (
    <main className={`auth-shell ${isWorkspacePage ? 'auth-setup' : 'auth-login'}`}>
      <aside className="auth-story">
        <a href="#login" className="auth-logo">
          <span><Icon name="store" /></span>Smart CRM
        </a>
        <div className="auth-story-content">
          <span className="auth-eyebrow">YOUR SCHOOL. ONE WORKSPACE.</span>
          <h2>More connected.<br />Better managed.</h2>
          <p>Bring your school, people and everyday operations together in one place.</p>
          <div className="auth-preview" aria-hidden="true">
            <div className="auth-preview-top">
              <span>Workspace overview</span><span className="auth-preview-dot" />
            </div>
            <div className="auth-preview-grid">
              <div><Icon name="user" /><strong>School</strong><small>Students &amp; teachers</small></div>
              <div><Icon name="type" /><strong>Modules</strong><small>Built around you</small></div>
            </div>
            <div className="auth-preview-bars">
              {[38, 58, 45, 74, 60, 90, 78].map((height, i) => <span key={i} style={{ height }} />)}
            </div>
            <div className="auth-preview-bottom">
              <span>One workspace</span><span>More possibilities ↗</span>
            </div>
          </div>
          <ul>
            <li><span>✓</span> Manage students, teachers and timetables</li>
            <li><span>✓</span> School, Gym and Barber services included</li>
            <li><span>✓</span> Keep your team&apos;s work in one place</li>
          </ul>
        </div>
        <p className="auth-story-footer">Smart CRM · Made for small organizations</p>
      </aside>

      <div className="auth-form-pane">
        <header className="auth-topline">
          <a href="#login" className="auth-mobile-brand">Smart CRM</a>
          <span>{isWorkspacePage ? 'Already have a workspace?' : 'New to Smart CRM?'}</span>
          <a href={isWorkspacePage ? '#login' : '#create-workspace'}>
            {isWorkspacePage ? 'Sign in' : 'Create a workspace'} →
          </a>
        </header>

        <section
          className={`page card ${isWorkspacePage ? 'workspace-card' : 'login-card'}`}
          aria-labelledby="title"
        >
          <p className="auth-kicker">
            {isWorkspacePage ? 'LET\u2019S GET YOU STARTED' : 'YOUR WORKSPACE AWAITS'}
          </p>
          <h1 id="title">{isWorkspacePage ? 'Workspace Setup' : 'Welcome Back'}</h1>
          <p className="subtitle">
            {isWorkspacePage
              ? 'Set up your school with Gym and Barber services included.'
              : 'Enter your details to access your dashboard.'}
          </p>

          <form onSubmit={handleSubmit} key={isWorkspacePage ? 'workspace' : 'login'}>
            {isWorkspacePage && (
              <>
                <Field label="School Name" id="business" icon="store" placeholder="e.g. Sunrise School" autoComplete="organization" pattern=".*\S.*" />
                <Field label="Owner Name" id="owner" icon="user" placeholder="Full Name" autoComplete="name" pattern=".*\S.*" />
              </>
            )}

            <Field
              label="Email"
              id="email"
              icon="mail"
              type="email"
              placeholder={isWorkspacePage ? 'name@business.com' : 'name@school.edu'}
              autoComplete="email"
            />

            <div className="password-field">
              {!isWorkspacePage && (
                <button
                  type="button"
                  className="forgot text-link"
                  onClick={() => setNotice('Password recovery will be available soon.')}
                >
                  Forgot password?
                </button>
              )}
              <Field
                label="Password"
                id="password"
                icon="lock"
                type="password"
                minLength={isWorkspacePage ? 6 : undefined}
                placeholder={isWorkspacePage ? 'Min. 6 characters' : '••••••••'}
                autoComplete={isWorkspacePage ? 'new-password' : 'current-password'}
              />
            </div>

            {isWorkspacePage && (
              <fieldset className="workspace-modules">
                <legend>Included services</legend>
                <p>One workspace for your school and student facilities.</p>
                {[
                  'School — students, admission, fees and timetable',
                  'Gym — student training sessions',
                  'Barber — clients, appointments and services',
                ].map((label) => (
                  <div key={label} className="auth-included">
                    <span>{label}</span><strong>Included ✓</strong>
                  </div>
                ))}
                <p>Shared overview, alerts and reports.</p>
              </fieldset>
            )}

            {!isWorkspacePage && (
              <label className="remember">
                <input type="checkbox" />Remember me for 30 days
              </label>
            )}

            <button className="primary" type="submit" disabled={isLoading}>
              {isWorkspacePage ? 'Create Workspace' : 'Login'}
              {isLoading ? <Spinner /> : <Icon name={isWorkspacePage ? 'rocket' : 'arrow'} size={26} />}
            </button>
          </form>

          {/* API error */}
          {error && <p className="notice error" role="alert">{error}</p>}

          {/* Local UI notices */}
          {notice && !error && <p className="notice" role="status">{notice}</p>}

          {!isWorkspacePage && (
            <>
              <div className="divider"><span />OR CONTINUE WITH<span /></div>
              <button
                className="google"
                onClick={() => setNotice('Google sign-in will be available soon.')}
              >
                <span className="google-g">G</span>Sign in with Google
              </button>
              <p className="footer">
                Don&apos;t have a workspace? <a href="#create-workspace">Create one</a>
              </p>
            </>
          )}

          <p className="footer">
            <a href="#school-dashboard">Preview School Dashboard</a>
          </p>
        </section>

        <footer className="auth-page-footer">Smart CRM · School Management Workspace</footer>
      </div>
    </main>
  )
}
