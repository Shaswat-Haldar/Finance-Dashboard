import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { balanceTrendByMonth } from '../utils/aggregates'
import { formatCurrency, monthLabel } from '../utils/format'
import { EmptyState } from './EmptyState'

export function BalanceTrendChart({ trendData, transactions, loading = false }) {
  let data = []
  if (trendData && trendData.length > 0) {
    let running = 0
    data = trendData.map((d) => {
      running += d.balance // backend 'balance' is the monthly net
      return {
        month: monthLabel(d.month),
        monthKey: d.month,
        net: d.balance,
        balance: running,
      }
    })
  } else if (transactions) {
    data = balanceTrendByMonth(transactions)
  }

  const strokeColor =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? '#2dd4bf'
      : '#0d9488'

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Balance trend</h2>
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/50" />
      </section>
    )
  }

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
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
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
              formatter={(value, _name, item) => [formatCurrency(value), item?.dataKey === 'net' ? 'Net' : 'Balance']}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#balFill)"
            />
            <Brush dataKey="month" height={20} travellerWidth={10} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
