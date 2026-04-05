import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { balanceTrendByMonth } from '../utils/aggregates'
import { formatCurrency } from '../utils/format'
import { EmptyState } from './EmptyState'

export function BalanceTrendChart({ transactions }) {
  const data = balanceTrendByMonth(transactions)

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Balance trend</h2>
        <EmptyState
          className="mt-6"
          title="No timeline yet"
          description="Add transactions to see how your balance moves month to month."
        />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Balance trend</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cumulative net balance by month
          </p>
        </div>
      </div>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              className="text-slate-500"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) =>
                Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`
              }
              className="text-slate-500"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid var(--color-border-subtle)',
              }}
              formatter={(value) => [formatCurrency(value), 'Balance']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#0d9488"
              strokeWidth={2}
              fill="url(#balFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
