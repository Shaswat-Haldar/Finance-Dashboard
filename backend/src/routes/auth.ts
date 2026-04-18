import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { signToken } from '../lib/jwt'
import { authMiddleware } from '../middleware/authMiddleware'

export const authRouter = new Hono()

// ─────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

// ─────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────
authRouter.post('/register', zValidator('json', registerSchema), async (c) => {
  const { name, email, password } = c.req.valid('json')

  // Check if email already exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (existing.length > 0) {
    return c.json({ error: 'An account with this email already exists' }, 409)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const [user] = await db
    .insert(users)
    .values({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })

  const token = await signToken({ userId: user.id, role: user.role })

  return c.json({ user, token }, 201)
})

// ─────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────
authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  // Use constant-time comparison to prevent timing attacks
  const dummyHash = '$2b$12$invalidhashtopreventtimingattacks000000000000000000000'
  const isValid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, dummyHash) && false

  if (!user || !isValid) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const token = await signToken({ userId: user.id, role: user.role })

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  })
})

// ─────────────────────────────────────────────
// GET /auth/me — returns current user (protected)
// ─────────────────────────────────────────────
authRouter.get('/me', authMiddleware, async (c) => {
  const { userId } = c.var.user

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user })
})

// ─────────────────────────────────────────────
// PATCH /auth/role — update role (helpful for demo)
// ─────────────────────────────────────────────
authRouter.patch('/role', authMiddleware, async (c) => {
  const { userId } = c.var.user
  const { role } = await c.req.json()

  if (role !== 'admin' && role !== 'viewer') {
    return c.json({ error: 'Invalid role' }, 400)
  }

  const [user] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })

  // Re-sign token with new role if needed (though the client can just use the user state)
  const token = await signToken({ userId: user.id, role: user.role })

  return c.json({ user, token })
})
