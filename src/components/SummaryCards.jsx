import { computeTotals } from '../utils/aggregates'
import { formatCurrency } from '../utils/format'

export function SummaryCards({ transactions }) {
  const { balance, income, expenses } = computeTotals(transactions)

  const cards = [
    {
      label: 'Total balance',
      value: formatCurrency(balance),
      hint: 'Income minus expenses',
      accent: 'from-teal-500/15 to-emerald-500/10',
    },
    {
      label: 'Income',
      value: formatCurrency(income),
      hint: 'All inflows',
      accent: 'from-emerald-500/15 to-teal-500/10',
    },
    {
      label: 'Expenses',
      value: formatCurrency(expenses),
      hint: 'All outflows',
      accent: 'from-rose-500/10 to-amber-500/10',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <article
          key={c.label}
          className={`relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-gradient-to-br ${c.accent} bg-[var(--color-surface-elevated)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5`}
        >
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {c.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{c.value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{c.hint}</p>
        </article>
      ))}
    </div>
  )
}
