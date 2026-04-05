import { buildInsights } from '../utils/aggregates'
import { formatCurrency } from '../utils/format'
import { EmptyState } from './EmptyState'

export function InsightsPanel({ transactions }) {
  const insights = buildInsights(transactions)

  if (transactions.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Insights</h2>
        <EmptyState
          className="mt-4"
          title="Nothing to analyze yet"
          description="Load or add transactions to surface spending patterns and comparisons."
        />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Insights</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Quick takeaways from your current dataset
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 dark:bg-slate-800/40">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Highest spending category
          </dt>
          <dd className="mt-2 text-lg font-semibold">
            {insights.topCategory ? (
              <>
                {insights.topCategory.name}
                <span className="ml-2 text-base font-normal text-slate-500 dark:text-slate-400">
                  {formatCurrency(insights.topCategory.value)}
                </span>
              </>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </dd>
        </div>

        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 dark:bg-slate-800/40">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Monthly comparison
          </dt>
          <dd className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {insights.monthlyComparison ? (
              <>
                <span className="font-semibold">{insights.monthlyComparison.currentLabel}</span>
                {' vs '}
                <span className="font-semibold">{insights.monthlyComparison.previousLabel}</span>
                <span className="mt-1 block text-slate-600 dark:text-slate-300">
                  Net change:{' '}
                  <span
                    className={
                      insights.monthlyComparison.delta >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {insights.monthlyComparison.delta >= 0 ? '+' : ''}
                    {formatCurrency(insights.monthlyComparison.delta)}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-slate-500">Need at least two months of data.</span>
            )}
          </dd>
        </div>
      </dl>

      <ul className="mt-6 space-y-3">
        {insights.observations.map((text, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-xl border border-teal-500/15 bg-teal-500/5 px-4 py-3 text-sm leading-relaxed text-slate-700 dark:border-teal-400/20 dark:bg-teal-950/30 dark:text-slate-200"
          >
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white dark:bg-teal-500"
              aria-hidden
            >
              {i + 1}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
