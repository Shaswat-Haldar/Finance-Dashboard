import { Hono } from 'hono'
import { sql, eq } from 'drizzle-orm'
import { db } from '../db'
import { transactions } from '../db/schema'
import { authMiddleware } from '../middleware/authMiddleware'

export const analyticsRouter = new Hono()

// All analytics routes require auth
analyticsRouter.use('*', authMiddleware)

// ─────────────────────────────────────────────
// GET /api/analytics/summary
// Total income, expense, balance, transaction count
// Powers the SummaryCards component
// ─────────────────────────────────────────────
analyticsRouter.get('/summary', async (c) => {
  const { userId } = c.var.user

  const result = await db.execute(sql`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount::float ELSE 0 END), 0) AS total_income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::float ELSE 0 END), 0) AS total_expense,
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount::float
                        WHEN type = 'expense' THEN -amount::float ELSE 0 END), 0) AS balance,
      COUNT(*) AS total_transactions
    FROM transactions
    WHERE user_id = ${userId}
  `)

  const row = result[0] as {
    total_income: string
    total_expense: string
    balance: string
    total_transactions: string
  }

  return c.json({
    data: {
      totalIncome:       parseFloat(row.total_income),
      totalExpense:      parseFloat(row.total_expense),
      balance:           parseFloat(row.balance),
      totalTransactions: parseInt(row.total_transactions, 10),
    },
  })
})

// ─────────────────────────────────────────────
// GET /api/analytics/trend
// Monthly income vs expense — powers BalanceTrendChart
// ─────────────────────────────────────────────
analyticsRouter.get('/trend', async (c) => {
  const { userId } = c.var.user

  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(date::date, 'YYYY-MM') AS month,
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount::float ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount::float ELSE 0 END), 0) AS expense
    FROM transactions
    WHERE user_id = ${userId}
    GROUP BY TO_CHAR(date::date, 'YYYY-MM')
    ORDER BY month ASC
  `) as Array<{ month: string; income: string; expense: string }>

  return c.json({
    data: rows.map((r) => ({
      month:   r.month,
      income:  parseFloat(r.income),
      expense: parseFloat(r.expense),
      balance: parseFloat(r.income) - parseFloat(r.expense),
    })),
  })
})

// ─────────────────────────────────────────────
// GET /api/analytics/by-category
// Expense totals per category — powers SpendingBreakdown pie chart
// ─────────────────────────────────────────────
analyticsRouter.get('/by-category', async (c) => {
  const { userId } = c.var.user

  const rows = await db.execute(sql`
    SELECT
      category,
      COALESCE(SUM(amount::float), 0) AS total
    FROM transactions
    WHERE user_id = ${userId}
      AND type = 'expense'
    GROUP BY category
    ORDER BY total DESC
  `) as Array<{ category: string; total: string }>

  return c.json({
    data: rows.map((r) => ({
      category: r.category,
      total:    parseFloat(r.total),
    })),
  })
})

// ─────────────────────────────────────────────
// GET /api/analytics/categories
// Distinct categories for the filter UI
// ─────────────────────────────────────────────
analyticsRouter.get('/categories', async (c) => {
  const { userId } = c.var.user

  const rows = await db
    .selectDistinct({ category: transactions.category })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(transactions.category)

  return c.json({ data: rows.map((r) => r.category) })
})
