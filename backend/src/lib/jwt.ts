import 'dotenv/config'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_secret_please_set_env',
)

export interface JwtPayload {
  userId: string
  role: string
}

/**
 * Sign a JWT token valid for the configured expiry (default: 7d).
 */
export async function signToken(payload: JwtPayload): Promise<string> {
  const expiry = (process.env.JWT_EXPIRES_IN ?? '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret)
}

/**
 * Verify a JWT token and return the payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secret)

  if (
    typeof payload.userId !== 'string' ||
    typeof payload.role !== 'string'
  ) {
    throw new Error('Invalid token payload shape')
  }

  return { userId: payload.userId, role: payload.role }
}
