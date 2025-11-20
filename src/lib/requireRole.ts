import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export type Role = 'USER' | 'ADMIN'

export async function requireRole(
  required: Role,
  authOptions?: NextAuthOptions
): Promise<{ user: any | null; error: 'unauthenticated' | 'forbidden' | null }> {
  const session = authOptions ? await getServerSession(authOptions) : await (getServerSession as any)()
  const user = session?.user as any
  if (!user) return { user: null, error: 'unauthenticated' }
  const role: Role = (user.role ?? 'USER')
  if (required === 'ADMIN' && role !== 'ADMIN') return { user: null, error: 'forbidden' }
  return { user, error: null }
}

export async function requireRoleOrResponse(
  required: Role,
  authOptions?: NextAuthOptions
): Promise<{ user: any } | NextResponse> {
  const session = authOptions ? await getServerSession(authOptions) : await (getServerSession as any)()
  const user = session?.user as any
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  const role: Role = (user.role ?? 'USER')
  if (required === 'ADMIN' && role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  return { user }
}
