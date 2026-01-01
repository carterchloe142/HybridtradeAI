
import { PrismaClient } from './lib/generated/prisma/client';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Successfully connected to DB via Prisma!');
    console.log('Users found:', users.length);
    if (users.length > 0) {
        console.log('Sample user:', users[0]);
    }
  } catch (e) {
    console.error('Prisma connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
