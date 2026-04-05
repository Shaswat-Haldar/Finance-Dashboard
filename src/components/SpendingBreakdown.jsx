import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { spendingByCategory, withChartColors } from '../utils/aggregates'
import { formatCurrency } from '../utils/format'
import { EmptyState } from './EmptyState'

export function SpendingBreakdown({ transactions }) {
  const raw = spendingByCategory(transactions)
  const data = withChartColors(raw)

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Spending by category</h2>
        <EmptyState
          className="mt-6"
          title="No expenses recorded"
          description="Expense transactions will appear here grouped by category."
        />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Spending by category</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Share of total expenses
        </p>
      </div>
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
        <div className="h-56 w-full max-w-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-full flex-1 space-y-2 text-sm">
          {data.map((d) => (
            <li
              key={d.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-3 py-2 dark:bg-slate-800/50"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.fill }}
                />
                {d.name}
              </span>
              <span className="font-medium tabular-nums">{formatCurrency(d.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
