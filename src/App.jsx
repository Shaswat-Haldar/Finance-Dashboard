import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { useDashboardStore } from './store/useDashboardStore'
import { Header } from './components/Header'
import { StickySubNav } from './components/StickySubNav'
import { SummaryCards } from './components/SummaryCards'
import { InsightsPanel } from './components/InsightsPanel'
import { TransactionsSection } from './components/TransactionsSection'
import { TransactionFormModal } from './components/TransactionFormModal'
import { ToastViewport } from './components/ToastViewport'

const BalanceTrendChart = lazy(() =>
  import('./components/BalanceTrendChart').then((m) => ({ default: m.BalanceTrendChart })),
)
const SpendingBreakdown = lazy(() =>
  import('./components/SpendingBreakdown').then((m) => ({ default: m.SpendingBreakdown })),
)

function LoadingScreen() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent dark:border-teal-400"
        aria-hidden
      />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading your dashboard…</p>
    </div>
  )
}

function ChartSkeleton({ title }) {
  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 h-64 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/50" />
    </section>
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      className="mx-auto mb-6 max-w-6xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
      role="alert"
    >
      <p className="font-medium">Could not load data</p>
      <p className="mt-1 opacity-90">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-800"
      >
        Retry
      </button>
    </div>
  )
}

export default function App() {
  const transactions = useDashboardStore((s) => s.transactions)
  const apiLoading = useDashboardStore((s) => s.apiLoading)
  const apiError = useDashboardStore((s) => s.apiError)
  const retryFetch = useDashboardStore((s) => s.retryFetch)
  const resetDemoData = useDashboardStore((s) => s.resetDemoData)
  const theme = useDashboardStore((s) => s.theme)
  const role = useDashboardStore((s) => s.role)
  const closeForm = useDashboardStore((s) => s.closeForm)
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery)
  const setFilterType = useDashboardStore((s) => s.setFilterType)

  const navItems = useMemo(
    () => [
      { href: '#overview', label: 'Overview' },
      { href: '#transactions', label: 'Transactions' },
      { href: '#insights', label: 'Insights' },
    ],
    [],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (role === 'viewer') closeForm()
  }, [role, closeForm])

  const initialFetchStarted = useRef(false)

  useEffect(() => {
    const loadIfEmpty = () => {
      if (initialFetchStarted.current) return
      const { transactions: txs, fetchInitialData: load, apiLoading } =
        useDashboardStore.getState()
      if (txs.length > 0 || apiLoading) return
      initialFetchStarted.current = true
      load()
    }

    if (useDashboardStore.persist.hasHydrated()) {
      loadIfEmpty()
    }
    return useDashboardStore.persist.onFinishHydration(() => loadIfEmpty())
  }, [])

  // URL filter sync for shareable links (?q=&type=income|expense)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    const type = params.get('type')
    if (q) setSearchQuery(q)
    if (type === 'income' || type === 'expense' || type === 'all') {
      setFilterType(type)
    }
  }, [setFilterType, setSearchQuery])

  const showLoader = apiLoading && transactions.length === 0

  return (
    <div className="min-h-screen pb-16">
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <Header />
      <StickySubNav items={navItems} />

      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        {apiError && transactions.length === 0 && (
          <ErrorBanner message={apiError} onRetry={retryFetch} />
        )}

        {showLoader ? (
          <LoadingScreen />
        ) : (
          <>
            <section id="overview" className="mb-2 flex scroll-mt-36 flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Overview · trends · spending · insights
              </p>
              <button
                type="button"
                onClick={() => resetDemoData()}
                disabled={apiLoading}
                className="text-xs font-medium text-teal-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-teal-400"
              >
                Reload demo data
              </button>
            </section>

            <div className="space-y-8">
              <SummaryCards transactions={transactions} />

              <Suspense
                fallback={
                  <div className="grid gap-8 lg:grid-cols-2">
                    <ChartSkeleton title="Balance trend" />
                    <ChartSkeleton title="Spending by category" />
                  </div>
                }
              >
                <div className="grid gap-8 lg:grid-cols-2">
                  <BalanceTrendChart transactions={transactions} loading={apiLoading} />
                  <SpendingBreakdown transactions={transactions} loading={apiLoading} />
                </div>
              </Suspense>

              <div id="insights" className="scroll-mt-36">
                <InsightsPanel transactions={transactions} />
              </div>

              <TransactionsSection />
            </div>
          </>
        )}
      </main>

      <TransactionFormModal />

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-400 dark:text-slate-500">
        Mock data & delayed API for demonstration · State persisted locally
      </footer>
      <ToastViewport />
    </div>
  )
}
