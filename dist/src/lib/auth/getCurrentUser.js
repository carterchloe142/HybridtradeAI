"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
const next_auth_1 = require("next-auth");
const prisma_1 = __importDefault(require("@lib/prisma"));
async function getCurrentUser(authOptions) {
    const session = authOptions ? await (0, next_auth_1.getServerSession)(authOptions) : await next_auth_1.getServerSession();
    const s = session?.user;
    if (!s)
        return null;
    const id = String(s.id || '');
    const email = String(s.email || '');
    if (id)
        return prisma_1.default.user.findUnique({ where: { id } });
    if (email)
        return prisma_1.default.user.findUnique({ where: { email } });
    return null;
}
