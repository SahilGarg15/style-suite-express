import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding API key...')

  await prisma.apiKey.upsert({
    where: { key: '37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a' },
    update: { isActive: true },
    create: {
      key: '37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a',
      name: 'Shopping Agent API Key',
      description: 'API key for shopping agent integration',
      isActive: true
    }
  })

  console.log('API key added successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
