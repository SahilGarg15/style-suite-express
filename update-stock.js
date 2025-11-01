import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateStock() {
  try {
    const result = await prisma.product.updateMany({
      data: {
        stock: 50
      }
    });

    console.log(`Updated ${result.count} products with stock = 50`);
  } catch (error) {
    console.error('Error updating stock:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateStock();
