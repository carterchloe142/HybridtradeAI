const { PrismaClient } = require('../lib/generated/prisma/client')

async function main() {
  const p = new PrismaClient()
  try {
    await p.$connect()
    console.log('connected')
    await p.$queryRawUnsafe('SELECT 1')
    console.log('select1 ok')
  } catch (e) {
    const code = e && e.code ? String(e.code) : ''
    const msg = e && e.message ? String(e.message) : String(e)
    console.error('prisma_connectivity_error', code, msg)
    process.exitCode = 1
  } finally {
    try { await p.$disconnect() } catch {}
  }
}

main()
