import { describe, expect, test } from 'vitest'
import {
  balanceTrendByMonth,
  buildInsights,
  computeTotals,
  spendingByCategory,
} from './aggregates'

const sample = [
  { id: '1', date: '2026-01-01', amount: 1000, category: 'Salary', type: 'income', description: 'a' },
  { id: '2', date: '2026-01-02', amount: 200, category: 'Food', type: 'expense', description: 'b' },
  { id: '3', date: '2026-02-01', amount: 1000, category: 'Salary', type: 'income', description: 'c' },
  { id: '4', date: '2026-02-03', amount: 300, category: 'Housing', type: 'expense', description: 'd' },
]

describe('aggregates', () => {
  test('computeTotals returns expected sums', () => {
    const totals = computeTotals(sample)
    expect(totals.income).toBe(2000)
    expect(totals.expenses).toBe(500)
    expect(totals.balance).toBe(1500)
  })

  test('spendingByCategory sorts by highest value', () => {
    const rows = spendingByCategory(sample)
    expect(rows[0]).toEqual({ name: 'Housing', value: 300 })
    expect(rows[1]).toEqual({ name: 'Food', value: 200 })
  })

  test('balanceTrendByMonth creates running balance points', () => {
    const trend = balanceTrendByMonth(sample)
    expect(trend.length).toBe(2)
    expect(trend[0].net).toBe(800)
    expect(trend[1].balance).toBe(1500)
  })

  test('buildInsights exposes monthly comparison', () => {
    const insights = buildInsights(sample)
    expect(insights.topCategory?.name).toBe('Housing')
    expect(insights.monthlyComparison).not.toBeNull()
  })
})
