import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function generateApiKey() {
  try {
    // Generate secure random key
    const key = crypto.randomBytes(32).toString('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name: 'AI Integration Key',
        description: 'API key for AI to fetch products and place orders',
        isActive: true
      }
    });

    console.log('\n✅ API Key Generated Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`API Key: ${apiKey.key}`);
    console.log(`Name: ${apiKey.name}`);
    console.log(`Description: ${apiKey.description}`);
    console.log(`Created: ${apiKey.createdAt}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  Save this key securely - it won\'t be shown again!\n');
  } catch (error) {
    console.error('Error generating API key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateApiKey();
