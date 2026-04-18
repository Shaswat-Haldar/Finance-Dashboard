import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { authRouter } from './routes/auth'
import { transactionsRouter } from './routes/transactions'
import { analyticsRouter } from './routes/analytics'

const app = new Hono()

// ─────────────────────────────────────────────
// Global middleware
// ─────────────────────────────────────────────
app.use('*', logger())
app.use('*', prettyJSON())
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.route('/auth', authRouter)
app.route('/api/transactions', transactionsRouter)
app.route('/api/analytics', analyticsRouter)

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'zuvlyn-finance-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }),
)

// ─────────────────────────────────────────────
// 404 catch-all
// ─────────────────────────────────────────────
app.notFound((c) =>
  c.json({ error: 'Route not found', path: c.req.path }, 404),
)

// ─────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001)

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`\n🚀  Zuvlyn Finance API`)
  console.log(`    Running on → http://localhost:${PORT}`)
  console.log(`    Health     → http://localhost:${PORT}/health`)
  console.log(`    DB Studio  → npm run db:studio\n`)
})
