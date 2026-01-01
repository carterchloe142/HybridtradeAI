
import { PrismaClient } from './lib/generated/prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log('Testing DB Connection...')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Missing')
  
  try {
    await prisma.$connect()
    console.log('Connected to Database!')
    
    // Test Transaction Create
    const userId = 'test-user-' + Date.now()
    console.log('Creating dummy user:', userId)
    
    // We need a user first due to FK
    // Check if we can find any user
    const user = await prisma.user.findFirst()
    let uid = user?.id
    
    if (!uid) {
        console.log('No users found, creating dummy...')
        // This might fail if email unique constraint
        const email = `test-${Date.now()}@example.com`
        const newUser = await prisma.user.create({
            data: {
                email,
                role: 'USER',
                updatedAt: new Date()
            }
        })
        uid = newUser.id
    }
    
    console.log('Using User ID:', uid)
    
    console.log('Attempting Transaction Create...')
    const txn = await prisma.transaction.create({
      data: {
        userId: uid!,
        type: 'DEPOSIT',
        amount: 100,
        status: 'PENDING',
        reference: JSON.stringify({ provider: 'nowpayments', test: true }),
        updatedAt: new Date()
      }
    })
    console.log('Transaction Created:', txn.id)
    
    // Clean up txn
    await prisma.transaction.delete({ where: { id: txn.id } })
    console.log('Test Transaction Deleted')
    
  } catch (e) {
    console.error('Test Failed:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
