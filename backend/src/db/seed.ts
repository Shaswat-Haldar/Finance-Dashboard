/**
 * Seed script — loads the same 26 mock transactions from the frontend
 * into Postgres under a demo user account.
 *
 * Run: npm run db:seed
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { db, client } from './index'
import { users, transactions } from './schema'
import { eq } from 'drizzle-orm'

const DEMO_EMAIL = 'demo@zuvlyn.com'
const DEMO_PASSWORD = 'Demo1234!'

const SEED_TRANSACTIONS = [
  { date: '2026-01-05', amount: 4200, category: 'Salary',        type: 'income',  description: 'Monthly salary' },
  { date: '2026-01-08', amount: 1200, category: 'Housing',       type: 'expense', description: 'Rent' },
  { date: '2026-01-10', amount: 180,  category: 'Utilities',     type: 'expense', description: 'Electric & water' },
  { date: '2026-01-12', amount: 340,  category: 'Food',          type: 'expense', description: 'Groceries' },
  { date: '2026-01-18', amount: 650,  category: 'Freelance',     type: 'income',  description: 'Design project' },
  { date: '2026-01-22', amount: 89,   category: 'Transport',     type: 'expense', description: 'Transit pass' },
  { date: '2026-01-25', amount: 120,  category: 'Entertainment', type: 'expense', description: 'Concert tickets' },
  { date: '2026-02-01', amount: 4200, category: 'Salary',        type: 'income',  description: 'Monthly salary' },
  { date: '2026-02-03', amount: 1200, category: 'Housing',       type: 'expense', description: 'Rent' },
  { date: '2026-02-06', amount: 410,  category: 'Food',          type: 'expense', description: 'Groceries & dining' },
  { date: '2026-02-09', amount: 95,   category: 'Transport',     type: 'expense', description: 'Fuel' },
  { date: '2026-02-14', amount: 220,  category: 'Shopping',      type: 'expense', description: 'Clothing' },
  { date: '2026-02-18', amount: 800,  category: 'Freelance',     type: 'income',  description: 'API integration work' },
  { date: '2026-02-21', amount: 175,  category: 'Utilities',     type: 'expense', description: 'Internet' },
  { date: '2026-02-26', amount: 60,   category: 'Entertainment', type: 'expense', description: 'Streaming' },
  { date: '2026-03-01', amount: 4200, category: 'Salary',        type: 'income',  description: 'Monthly salary' },
  { date: '2026-03-02', amount: 1200, category: 'Housing',       type: 'expense', description: 'Rent' },
  { date: '2026-03-05', amount: 380,  category: 'Food',          type: 'expense', description: 'Groceries' },
  { date: '2026-03-08', amount: 145,  category: 'Transport',     type: 'expense', description: 'Rideshare' },
  { date: '2026-03-11', amount: 290,  category: 'Shopping',      type: 'expense', description: 'Electronics accessory' },
  { date: '2026-03-15', amount: 500,  category: 'Freelance',     type: 'income',  description: 'Consulting call' },
  { date: '2026-03-18', amount: 165,  category: 'Utilities',     type: 'expense', description: 'Phone bill' },
  { date: '2026-03-22', amount: 72,   category: 'Entertainment', type: 'expense', description: 'Games' },
  { date: '2026-03-28', amount: 210,  category: 'Food',          type: 'expense', description: 'Restaurant week' },
  { date: '2026-04-01', amount: 4200, category: 'Salary',        type: 'income',  description: 'Monthly salary' },
  { date: '2026-04-02', amount: 1200, category: 'Housing',       type: 'expense', description: 'Rent' },
]

async function seed() {
  console.log('🌱  Starting database seed...')

  // Upsert demo user
  const existing = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1)

  let userId: string

  if (existing.length > 0) {
    userId = existing[0].id
    console.log(`✅  Demo user already exists (${userId}) — skipping user creation`)
  } else {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
    const [user] = await db
      .insert(users)
      .values({ email: DEMO_EMAIL, name: 'Demo User', passwordHash, role: 'admin' })
      .returning({ id: users.id })
    userId = user.id
    console.log(`✅  Created demo user: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  }

  // Clear existing transactions for a clean seed
  await db.delete(transactions).where(eq(transactions.userId, userId))
  console.log('🗑   Cleared previous transactions for demo user')

  // Insert seed transactions
  await db.insert(transactions).values(
    SEED_TRANSACTIONS.map((t) => ({
      userId,
      date: t.date,
      amount: String(t.amount),
      category: t.category,
      type: t.type,
      description: t.description,
    })),
  )

  console.log(`✅  Inserted ${SEED_TRANSACTIONS.length} seed transactions`)
  console.log('\n🚀  Seed complete!')
  console.log(`    Login: ${DEMO_EMAIL}`)
  console.log(`    Password: ${DEMO_PASSWORD}`)
}

seed()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(() => client.end())
