import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkApiKey() {
  try {
    const apiKey = '37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a';
    
    console.log(`\nChecking for API key: ${apiKey}\n`);
    
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    });
    
    if (key) {
      console.log('✅ API Key found in database!');
      console.log(`ID: ${key.id}`);
      console.log(`Name: ${key.name}`);
      console.log(`Active: ${key.isActive}`);
      console.log(`Created: ${key.createdAt}`);
      console.log(`Last Used: ${key.lastUsed || 'Never'}`);
    } else {
      console.log('❌ API Key NOT found in database!');
      console.log('\nAll API keys in database:');
      const allKeys = await prisma.apiKey.findMany();
      console.log(allKeys);
    }
  } catch (error) {
    console.error('Error checking API key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiKey();
