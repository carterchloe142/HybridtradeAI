import { PrismaClient } from '../../lib/generated/prisma/client';

if (process.env.VERCEL_ENV === "production" && process.env.NEXT_PHASE === "phase-production-build") {
  throw new Error("Skipping API execution during build");
}

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
