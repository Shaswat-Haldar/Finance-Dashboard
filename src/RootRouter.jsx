import { useEffect, useMemo, useState } from 'react'
import App from './App'
import { useDashboardStore } from './store/useDashboardStore'

const AUTH_ROUTES = new Set(['/login', '/register'])
const DASHBOARD_ROUTE = '/dashboard'

function ThemeToggleButton() {
  const theme = useDashboardStore((s) => s.theme)
  const setTheme = useDashboardStore((s) => s.setTheme)

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm font-medium shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

function navigateTo(path, setPathname) {
  window.history.pushState({}, '', path)
  setPathname(path)
}

function AuthLayout({ mode, onSwitch, onDemo }) {
  const isLogin = mode === 'login'
  const register = useDashboardStore((s) => s.register)
  const login = useDashboardStore((s) => s.login)
  const loading = useDashboardStore((s) => s.apiLoading)
  const error = useDashboardStore((s) => s.apiError)
  const pushToast = useDashboardStore((s) => s.pushToast)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    let result
    if (isLogin) {
      result = await login(formData.email, formData.password)
    } else {
      result = await register(formData.name, formData.email, formData.password)
    }

    if (result.success) {
      pushToast(isLogin ? 'Welcome back!' : 'Account created successfully!', 'success')
      navigateTo(DASHBOARD_ROUTE, window.setPathnameFromOuter)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-100 via-cyan-50 to-slate-100 opacity-90 dark:from-teal-950/30 dark:via-slate-950 dark:to-slate-900" />
      <div className="pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/20" />
      <div className="pointer-events-none absolute -bottom-10 right-6 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />

      <section className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] shadow-2xl">
        <div className="grid lg:grid-cols-2">
          <div className="border-b border-[var(--color-border-subtle)] p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div className="mb-10 flex items-center justify-between">
              <p className="rounded-full bg-[var(--color-accent-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                Zuvlyn Finance
              </p>
              <ThemeToggleButton />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {isLogin
                ? 'Sign in to continue managing your budget, track spending, and review trends.'
                : 'Register your account to start tracking transactions and exploring insights.'}
            </p>

            {error && (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Full Name
                  </span>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)]"
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email Address
                </span>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Password
                </span>
                <input
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)]"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
              >
                {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={onSwitch}
                className="font-semibold text-[var(--color-accent)] underline-offset-2 hover:underline"
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>

          <aside className="p-8 lg:p-10">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Try the Demo Account
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Access the pre-loaded finance dashboard with mock data and trends. 
              No registration required for the demo experience.
            </p>

            <div className="mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Demo Workspace
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Uses credentials: <br/>
                <b>demo@zuvlyn.com</b> / <b>Demo1234!</b>
              </p>
              <button
                type="button"
                onClick={onDemo}
                disabled={loading}
                className="mt-4 w-full rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-accent)] transition hover:brightness-95"
              >
                Open Demo
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export function RootRouter() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const theme = useDashboardStore((s) => s.theme)
  const token = useDashboardStore((s) => s.token)
  const login = useDashboardStore((s) => s.login)

  // Expose setPathname for the inner layout to use without props drilling deep
  window.setPathnameFromOuter = setPathname

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Navigation Logic
  useEffect(() => {
    const isAuth = AUTH_ROUTES.has(pathname)
    
    if (token) {
      if (isAuth || pathname === '/') {
        navigateTo(DASHBOARD_ROUTE, setPathname)
      }
    } else {
      if (!isAuth) {
        navigateTo('/login', setPathname)
      }
    }
  }, [pathname, token])

  const mode = useMemo(() => (pathname === '/register' ? 'register' : 'login'), [pathname])

  const handleDemo = async () => {
    const res = await login('demo@zuvlyn.com', 'Demo1234!')
    if (res.success) navigateTo(DASHBOARD_ROUTE, setPathname)
  }

  if (token && pathname === DASHBOARD_ROUTE) {
    return <App />
  }

  return (
    <AuthLayout
      mode={mode}
      onSwitch={() => navigateTo(mode === 'login' ? '/register' : '/login', setPathname)}
      onDemo={handleDemo}
    />
  )
}
