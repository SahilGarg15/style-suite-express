import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to validate API key
const validateApiKey = async (apiKey: string | undefined): Promise<boolean> => {
  if (!apiKey) return false;
  
  try {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey, isActive: true }
    });
    
    if (key) {
      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsed: new Date() }
      });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validate API key
  const apiKey = req.headers['x-api-key'] as string;
  const isValid = await validateApiKey(apiKey);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, category, subcategory, search, minPrice, maxPrice, limit, offset } = req.query;

    // Get single product by ID
    if (id && typeof id === 'string') {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          reviews: true
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const reviewCount = product.reviews.length;
      const averageRating = reviewCount > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

      const { reviews, ...productData } = product;

      return res.status(200).json({
        ...productData,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10
      });
    }

    // Build filter conditions
    const where: any = { isActive: true };
    
    if (category && typeof category === 'string') {
      where.category = category;
    }
    
    if (subcategory && typeof subcategory === 'string') {
      where.subcategory = subcategory;
    }
    
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const limitNum = limit ? Number(limit) : 20;
    const offsetNum = offset ? Number(offset) : 0;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          reviews: true
        },
        take: limitNum,
        skip: offsetNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const productsWithStats = products.map(product => {
      const reviewCount = product.reviews.length;
      const averageRating = reviewCount > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

      const { reviews, ...productData } = product;

      return {
        ...productData,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10
      };
    });

    return res.status(200).json({
      products: productsWithStats,
      total,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
