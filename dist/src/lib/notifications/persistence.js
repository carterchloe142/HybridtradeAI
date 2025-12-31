"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.createGlobalNotification = createGlobalNotification;
exports.deliverGlobalToUsers = deliverGlobalToUsers;
const prisma_1 = __importDefault(require("@lib/prisma"));
async function createNotification(userId, type, title, message, link) {
    return prisma_1.default.notification.create({ data: { userId, type, title, message, link, read: false } });
}
async function createGlobalNotification(type, title, message) {
    return prisma_1.default.globalNotification.create({ data: { type, title, message } });
}
async function deliverGlobalToUsers(globalId, userIds) {
    if (!userIds.length)
        return { count: 0 };
    const deliveries = userIds.map((userId) => ({ globalNotificationId: globalId, userId }));
    const result = await prisma_1.default.notificationDelivery.createMany({ data: deliveries, skipDuplicates: true });
    return { count: result.count };
}
