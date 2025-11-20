import { NextRequest } from 'next/server'
import prisma from '@lib/prisma'
import { Prisma } from '@prisma/client'
import { requireRole } from '@lib/requireRole'
import { publish } from '@lib/sse'

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole('ADMIN')
  if (error) return new Response(JSON.stringify({ error }), { status: error === 'unauthenticated' ? 401 : 403 })
  const adminId = String(user.id)

  const body = await req.json()
  const userId = String(body?.userId || '')
  const amount = Number(body?.amount || 0)
  const currency = String(body?.currency || 'USD')
  const note = String(body?.note || '')

  if (!userId || !amount || Number.isNaN(amount) || amount <= 0) {
    return new Response(JSON.stringify({ error: 'invalid' }), { status: 400 })
  }

  try {
    // Transactionally update wallet, ledger, and admin action
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // find or create wallet
      let wallet = await tx.wallet.findUnique({ where: { userId_currency: { userId, currency } } as any }).catch(() => null)
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId, currency, balance: amount } as any })
      } else {
        wallet = await tx.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } as any } as any })
      }

      const txRecord = await tx.transaction.create({
        data: {
          userId,
          type: 'ADMIN_CREDIT',
          amount: amount as any,
          status: 'COMPLETED',
          metadata: { note, currency },
        },
      })

      const wt = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: amount as any,
          type: 'CREDIT',
          source: 'admin_manual_credit',
          reference: txRecord.id,
          note,
          performedBy: adminId,
        },
      })

      const adminAction = await tx.adminAction.create({
        data: {
          adminId,
          userId,
          amount: amount as any,
          action: 'MANUAL_CREDIT',
          note,
          status: 'COMPLETED',
        },
      })

      const notification = await tx.notification.create({
        data: {
          userId,
          type: 'info',
          title: 'Account credited',
          message: `Your account was credited with ${amount} ${currency}. ${note || ''}`.trim(),
        },
      })

      return { wallet, txRecord, wt, adminAction, notification }
    })

    // publish notification to user channel
    await publish(`user:${userId}`, { id: result.notification.id, title: result.notification.title, message: result.notification.message, createdAt: result.notification.createdAt })

    // publish admin audit event
    await publish(`admin:${adminId}`, { type: 'manual_credit', userId, amount, currency, note, notificationId: result.notification.id })

    return new Response(JSON.stringify({ ok: true, id: result.txRecord.id }), { status: 200 })
  } catch (err) {
    console.error('manual-credit error', err)
    return new Response(JSON.stringify({ error: 'server_error' }), { status: 500 })
  }
}
