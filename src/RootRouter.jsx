import { useEffect, useMemo, useState } from 'react'
import App from './App'
import { useDashboardStore } from './store/useDashboardStore'

const AUTH_ROUTES = new Set(['/login', '/register'])
const DEMO_ROUTE = '/demo'

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

function AuthLayout({ mode, onSwitch, onOpenDemo }) {
  const isLogin = mode === 'login'

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

            <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
              {isLogin ? (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Username / Email
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your username or email"
                    className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)]"
                    autoComplete="username"
                  />
                </label>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Full Name
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)]"
                      autoComplete="name"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email
                    </span>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)]"
                      autoComplete="email"
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-muted)]"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                {isLogin ? 'Login' : 'Register'}
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
              Explore Demo Dashboard
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Use the demo workspace to preview the full finance dashboard experience.
              The Demo button opens your current frontend with mock data, charts, and
              transaction management for presentation and testing.
            </p>

            <div className="mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Demo access
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                No backend auth required right now. Click below to open the current
                demo dashboard directly.
              </p>
              <button
                type="button"
                onClick={onOpenDemo}
                className="mt-4 w-full rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-accent)] transition hover:brightness-95"
              >
                Demo
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const valid = AUTH_ROUTES.has(pathname) || pathname === DEMO_ROUTE
    if (!valid) {
      window.history.replaceState({}, '', '/login')
      setPathname('/login')
    }
  }, [pathname])

  const mode = useMemo(() => (pathname === '/register' ? 'register' : 'login'), [pathname])

  if (pathname === DEMO_ROUTE) {
    return <App />
  }

  return (
    <AuthLayout
      mode={mode}
      onSwitch={() => navigateTo(mode === 'login' ? '/register' : '/login', setPathname)}
      onOpenDemo={() => navigateTo(DEMO_ROUTE, setPathname)}
    />
  )
}
