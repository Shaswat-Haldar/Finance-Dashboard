import { describe, expect, test } from 'vitest'
import { transactionsToCsv } from './exportData'

describe('exportData', () => {
  test('transactionsToCsv emits header and escaped rows', () => {
    const csv = transactionsToCsv([
      {
        id: 't1',
        date: '2026-03-01',
        amount: 1234,
        category: 'Food, Dining',
        type: 'expense',
        description: 'Said "hello"',
      },
    ])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('id,date,amount,category,type,description')
    expect(lines[1]).toContain('"Food, Dining"')
    expect(lines[1]).toContain('"Said ""hello"""')
  })
})
