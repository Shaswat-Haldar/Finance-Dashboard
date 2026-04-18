import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { and, eq, gte, lte, ilike, or, asc, desc, count, sql } from 'drizzle-orm'
import { db } from '../db'
import { transactions } from '../db/schema'
import { authMiddleware } from '../middleware/authMiddleware'

export const transactionsRouter = new Hono()

// ─────────────────────────────────────────────
// All routes require auth
// ─────────────────────────────────────────────
transactionsRouter.use('*', authMiddleware)

// ─────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────
const transactionBody = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  amount: z.number().positive('Amount must be positive').max(1_000_000),
  category: z.string().min(1).max(50).transform((s) => s.trim()),
  type: z.enum(['income', 'expense']),
  description: z.string().max(200).default('').transform((s) => s.trim()),
})

const listQuerySchema = z.object({
  page:       z.string().optional().transform((v) => Math.max(1, Number(v ?? 1))),
  limit:      z.string().optional().transform((v) => Math.min(200, Math.max(1, Number(v ?? 50)))),
  type:       z.enum(['income', 'expense', 'all']).optional().default('all'),
  category:   z.string().optional(),
  search:     z.string().optional(),
  dateFrom:   z.string().optional(),
  dateTo:     z.string().optional(),
  amountMin:  z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  amountMax:  z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  sortBy:     z.enum(['date', 'amount', 'category']).optional().default('date'),
  sortDir:    z.enum(['asc', 'desc']).optional().default('desc'),
})

// ─────────────────────────────────────────────
// Helper — parse amount from numeric string to float
// ─────────────────────────────────────────────
function parseRow(row: typeof transactions.$inferSelect) {
  return {
    ...row,
    amount: parseFloat(row.amount as unknown as string),
  }
}

// ─────────────────────────────────────────────
// GET /api/transactions
// ─────────────────────────────────────────────
transactionsRouter.get('/', zValidator('query', listQuerySchema), async (c) => {
  const {
    page, limit, type, category, search,
    dateFrom, dateTo, amountMin, amountMax,
    sortBy, sortDir,
  } = c.req.valid('query')
  const { userId } = c.var.user

  // Build WHERE conditions
  const conditions = [eq(transactions.userId, userId)]

  if (type !== 'all') {
    conditions.push(eq(transactions.type, type))
  }
  if (category) {
    conditions.push(eq(transactions.category, category))
  }
  if (search) {
    conditions.push(
      or(
        ilike(transactions.description, `%${search}%`),
        ilike(transactions.category, `%${search}%`),
      )!,
    )
  }
  if (dateFrom) conditions.push(gte(transactions.date, dateFrom))
  if (dateTo)   conditions.push(lte(transactions.date, dateTo))
  if (amountMin !== undefined) {
    conditions.push(gte(transactions.amount, String(amountMin)))
  }
  if (amountMax !== undefined) {
    conditions.push(lte(transactions.amount, String(amountMax)))
  }

  const whereClause = and(...conditions)

  // Order
  const orderCol =
    sortBy === 'amount'   ? transactions.amount :
    sortBy === 'category' ? transactions.category :
                            transactions.date
  const orderFn = sortDir === 'asc' ? asc : desc

  // Parallel: data + total count
  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(whereClause)
      .orderBy(orderFn(orderCol))
      .limit(limit)
      .offset((page - 1) * limit),

    db
      .select({ total: count() })
      .from(transactions)
      .where(whereClause),
  ])

  return c.json({
    data: rows.map(parseRow),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// ─────────────────────────────────────────────
// GET /api/transactions/:id
// ─────────────────────────────────────────────
transactionsRouter.get('/:id', async (c) => {
  const { userId } = c.var.user
  const id = c.req.param('id')

  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1)

  if (!row) return c.json({ error: 'Transaction not found' }, 404)

  return c.json({ data: parseRow(row) })
})

// ─────────────────────────────────────────────
// POST /api/transactions
// ─────────────────────────────────────────────
transactionsRouter.post('/', zValidator('json', transactionBody), async (c) => {
  const { userId, role } = c.var.user

  // Only admin role can create transactions
  if (role !== 'admin') {
    return c.json({ error: 'Forbidden — admin access required to add transactions' }, 403)
  }

  const body = c.req.valid('json')

  const [row] = await db
    .insert(transactions)
    .values({
      userId,
      date: body.date,
      amount: String(body.amount),
      category: body.category,
      type: body.type,
      description: body.description,
    })
    .returning()

  return c.json({ data: parseRow(row) }, 201)
})

// ─────────────────────────────────────────────
// PATCH /api/transactions/:id
// ─────────────────────────────────────────────
transactionsRouter.patch(
  '/:id',
  zValidator('json', transactionBody.partial()),
  async (c) => {
    const { userId, role } = c.var.user
    const id = c.req.param('id')

    if (role !== 'admin') {
      return c.json({ error: 'Forbidden — admin access required' }, 403)
    }

    // Ensure it belongs to this user
    const [existing] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .limit(1)

    if (!existing) return c.json({ error: 'Transaction not found' }, 404)

    const body = c.req.valid('json')
    const [updated] = await db
      .update(transactions)
      .set({
        ...(body.date        !== undefined && { date: body.date }),
        ...(body.amount      !== undefined && { amount: String(body.amount) }),
        ...(body.category    !== undefined && { category: body.category }),
        ...(body.type        !== undefined && { type: body.type }),
        ...(body.description !== undefined && { description: body.description }),
        updatedAt: sql`now()`,
      })
      .where(eq(transactions.id, id))
      .returning()

    return c.json({ data: parseRow(updated) })
  },
)

// ─────────────────────────────────────────────
// DELETE /api/transactions/:id
// ─────────────────────────────────────────────
transactionsRouter.delete('/:id', async (c) => {
  const { userId, role } = c.var.user
  const id = c.req.param('id')

  if (role !== 'admin') {
    return c.json({ error: 'Forbidden — admin access required' }, 403)
  }

  const [deleted] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning({ id: transactions.id })

  if (!deleted) return c.json({ error: 'Transaction not found' }, 404)

  return c.json({ success: true, id: deleted.id })
})
