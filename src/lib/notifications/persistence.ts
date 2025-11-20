import prisma from '@lib/prisma'

export async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  return prisma.notification.create({ data: { userId, type, title, message, link, read: false } })
}

export async function createGlobalNotification(type: string, title: string, message: string) {
  return prisma.globalNotification.create({ data: { type, title, message } })
}

export async function deliverGlobalToUsers(globalId: string, userIds: string[]) {
  if (!userIds.length) return { count: 0 }
  const deliveries = userIds.map((userId) => ({ globalNotificationId: globalId, userId }))
  const result = await prisma.notificationDelivery.createMany({ data: deliveries, skipDuplicates: true })
  return { count: result.count }
}
