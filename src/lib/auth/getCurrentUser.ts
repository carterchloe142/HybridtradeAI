import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import prisma from '@lib/prisma'

export async function getCurrentUser(authOptions?: NextAuthOptions) {
  const session = authOptions ? await getServerSession(authOptions) : await (getServerSession as any)()
  const s = session?.user as any
  if (!s) return null
  const id = String(s.id || '')
  const email = String(s.email || '')
  if (id) return prisma.user.findUnique({ where: { id } })
  if (email) return prisma.user.findUnique({ where: { email } })
  return null
}

