import { monthKey, monthLabel } from './format'
import { sanitizeTransactions } from './transactions'

function validList(transactions) {
  return sanitizeTransactions(Array.isArray(transactions) ? transactions : [])
}

export function computeTotals(transactions) {
  let income = 0
  let expenses = 0
  for (const t of validList(transactions)) {
    if (t.type === 'income') income += t.amount
    else expenses += t.amount
  }
  return {
    income,
    expenses,
    balance: income - expenses,
  }
}

/** Running net balance by month (chronological). */
export function balanceTrendByMonth(transactions) {
  const byMonth = new Map()
  for (const t of validList(transactions)) {
    const k = monthKey(t.date)
    if (!k) continue
    if (!byMonth.has(k)) byMonth.set(k, { income: 0, expenses: 0 })
    const bucket = byMonth.get(k)
    if (t.type === 'income') bucket.income += t.amount
    else bucket.expenses += t.amount
  }
  const keys = [...byMonth.keys()].sort()
  let running = 0
  return keys.map((k) => {
    const { income, expenses } = byMonth.get(k)
    running += income - expenses
    return {
      month: monthLabel(k),
      monthKey: k,
      net: income - expenses,
      balance: running,
    }
  })
}

export function spendingByCategory(transactions) {
  const map = new Map()
  for (const t of validList(transactions)) {
    if (t.type !== 'expense') continue
    map.set(t.category, (map.get(t.category) || 0) + t.amount)
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

const CHART_COLORS = [
  '#0d9488',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#ef4444',
  '#64748b',
]

export function withChartColors(items) {
  if (!Array.isArray(items)) return []
  return items.map((item, i) => ({
    ...item,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))
}

export function buildInsights(transactions) {
  const { income, expenses, balance } = computeTotals(transactions)
  const spending = spendingByCategory(transactions)
  const topCategory = spending[0] || null

  const byMonth = balanceTrendByMonth(transactions)
  let monthlyComparison = null
  if (byMonth.length >= 2) {
    const last = byMonth[byMonth.length - 1]
    const prev = byMonth[byMonth.length - 2]
    monthlyComparison = {
      currentLabel: last.month,
      previousLabel: prev.month,
      currentNet: last.net,
      previousNet: prev.net,
      delta: last.net - prev.net,
    }
  }

  const savingsRate =
    income > 0 ? Math.round(((income - expenses) / income) * 1000) / 10 : null

  const observations = []
  if (topCategory) {
    observations.push(
      `${topCategory.name} is your largest expense category at ${topCategory.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}.`,
    )
  }
  if (savingsRate != null && savingsRate >= 0) {
    observations.push(
      `You retained about ${savingsRate}% of income after expenses in the recorded period.`,
    )
  }
  if (monthlyComparison) {
    const dir = monthlyComparison.delta >= 0 ? 'better' : 'tighter'
    observations.push(
      `Net cash flow was ${dir} in ${monthlyComparison.currentLabel} vs ${monthlyComparison.previousLabel} (${monthlyComparison.delta >= 0 ? '+' : ''}${monthlyComparison.delta.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}).`,
    )
  }
  if (balance < 0) {
    observations.push('Total expenses exceed income in this dataset — worth reviewing recurring costs.')
  }

  return {
    topCategory,
    monthlyComparison,
    savingsRate,
    observations,
    income,
    expenses,
    balance,
  }
}
