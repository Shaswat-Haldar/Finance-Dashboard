import type { MiddlewareHandler } from 'hono'
import { verifyToken, type JwtPayload } from '../lib/jwt'

// Extend Hono's context variables to carry the authenticated user
declare module 'hono' {
  interface ContextVariableMap {
    user: JwtPayload
  }
}

/**
 * Protect any route — requires a valid Bearer token in the Authorization header.
 * On success, sets `c.var.user` with `{ userId, role }`.
 * On failure, returns 401.
 */
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authorization = c.req.header('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized — missing or malformed token' }, 401)
  }

  const token = authorization.replace('Bearer ', '').trim()

  try {
    const payload = await verifyToken(token)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Unauthorized — invalid or expired token' }, 401)
  }
}

/**
 * Additional guard — only allow admin role through.
 * Must be used AFTER authMiddleware.
 */
export const adminOnly: MiddlewareHandler = async (c, next) => {
  const user = c.var.user
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden — admin access required' }, 403)
  }
  await next()
}
