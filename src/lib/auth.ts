import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'ascent-runclub-secret-change-in-production'
)

const COOKIE_NAME = 'ascent-session'

export interface SessionPayload {
  userId: string
  role: 'athlete' | 'coach'
  athleteId: string | null
  name: string
  email: string
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encrypt(payload)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return decrypt(token)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  })
}

export async function authenticateAthlete(identifier: string): Promise<SessionPayload | null> {
  const COACH_CODE = 'ENTRENADOR'

  // Coach login
  if (identifier.trim().toUpperCase() === COACH_CODE) {
    return {
      userId: 'coach',
      role: 'coach',
      athleteId: null,
      name: 'Entrenador',
      email: 'coach@ascentrunclub.com',
    }
  }

  // Athlete login by email or access code
  const trimmed = identifier.trim()
  const lower = trimmed.toLowerCase()

  const athlete = await db.athlete.findFirst({
    where: {
      OR: [
        { email: lower },
        { accessCode: trimmed.toUpperCase() },
      ],
    },
  })

  if (!athlete) return null

  return {
    userId: athlete.id,
    role: 'athlete',
    athleteId: athlete.id,
    name: athlete.name,
    email: athlete.email,
  }
}
