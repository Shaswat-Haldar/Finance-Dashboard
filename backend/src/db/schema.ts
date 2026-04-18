import {
  pgTable,
  uuid,
  text,
  numeric,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─────────────────────────────────────────────
// Users table
// ─────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  /** 'viewer' can read, 'admin' can also write transactions */
  role: text('role').notNull().default('viewer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─────────────────────────────────────────────
// Transactions table
// ─────────────────────────────────────────────
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** ISO date string stored as Postgres DATE — e.g. '2026-01-05' */
    date: date('date').notNull(),
    /** NUMERIC(12,2) — stored as string by postgres-js, parsed to float in app */
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    category: text('category').notNull(),
    /** 'income' | 'expense' */
    type: text('type').notNull(),
    description: text('description').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Fast lookup: all transactions for a user ordered by date
    index('idx_txn_user_date').on(table.userId, table.date),
    // Fast category filtering per user
    index('idx_txn_user_category').on(table.userId, table.category),
  ],
)

// ─────────────────────────────────────────────
// Relations (for Drizzle relational queries)
// ─────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}))

// ─────────────────────────────────────────────
// Derived TypeScript types
// ─────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
