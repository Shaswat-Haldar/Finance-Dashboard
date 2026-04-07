import { useDashboardStore } from '../store/useDashboardStore'
import { exportTransactionsCsv, exportTransactionsJson } from '../utils/exportData'
import { formatDateTime } from '../utils/format'

/** Shared look for header actions + tactile press feedback */
const headerControlBase =
  'rounded-lg border border-teal-600/30 bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-teal-700 shadow-sm ' +
  'cursor-pointer transition-all duration-150 ease-out ' +
  'hover:border-teal-500/50 hover:bg-teal-50/90 ' +
  'active:scale-[0.96] active:border-teal-600/55 active:bg-teal-100/80 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/35 ' +
  'dark:border-teal-400/35 dark:text-teal-300 dark:hover:bg-slate-800/90 dark:active:bg-slate-700/85 ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-teal-600/30 disabled:hover:bg-[var(--color-surface)] ' +
  'disabled:active:scale-100 dark:disabled:hover:border-teal-400/35 dark:disabled:hover:bg-[var(--color-surface)]'

const roleSelectClasses =
  'rounded-lg border border-teal-600/30 bg-[var(--color-surface)] px-3 py-2 text-sm text-teal-800 shadow-sm ' +
  'cursor-pointer transition-all duration-150 ease-out ' +
  'hover:border-teal-500/50 hover:bg-teal-50/90 ' +
  'active:scale-[0.97] active:border-teal-600/55 active:bg-teal-100/80 ' +
  'focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ' +
  'dark:border-teal-400/35 dark:text-teal-100 dark:hover:bg-slate-800/90 dark:active:bg-slate-700/85'

export function Header() {
  const role = useDashboardStore((s) => s.role)
  const setRole = useDashboardStore((s) => s.setRole)
  const theme = useDashboardStore((s) => s.theme)
  const setTheme = useDashboardStore((s) => s.setTheme)
  const transactions = useDashboardStore((s) => s.transactions)
  const lastUpdatedAt = useDashboardStore((s) => s.lastUpdatedAt)
  const pushToast = useDashboardStore((s) => s.pushToast)
  const isAdmin = role === 'admin'

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Personal finance dashboard
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Finance Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lastUpdatedAt ? `Last updated ${formatDateTime(lastUpdatedAt)}` : 'Not updated yet'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="sr-only">Role</span>
            <span className="hidden sm:inline">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={roleSelectClasses}
              aria-label="Select role"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isAdmin
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {isAdmin ? 'Can edit' : 'View only'}
            </span>
          </label>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={headerControlBase}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {isAdmin && <div className="flex gap-2">
            <button
              type="button"
              disabled={transactions.length === 0}
              onClick={() => {
                exportTransactionsCsv(transactions)
                pushToast('CSV exported successfully.', 'success')
              }}
              className={headerControlBase}
            >
              CSV
            </button>
            <button
              type="button"
              disabled={transactions.length === 0}
              onClick={() => {
                exportTransactionsJson(transactions)
                pushToast('JSON exported successfully.', 'success')
              }}
              className={headerControlBase}
            >
              JSON
            </button>
          </div>}
        </div>
      </div>
    </header>
  )
}
