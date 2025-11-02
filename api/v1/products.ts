import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    const { category, search, minPrice, maxPrice, limit = '50', offset = '0', id } = req.query;

    // Get single product by ID
    if (id && typeof id === 'string') {
      const product = await prisma.product.findUnique({
        where: { id, isActive: true },
        include: {
          _count: {
            select: { reviews: true }
          }
        }
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Calculate average rating
      const reviews = await prisma.review.findMany({
        where: { productId: id },
        select: { rating: true }
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return res.status(200).json({
        ...product,
        reviewCount: product._count.reviews,
        averageRating: Math.round(averageRating * 10) / 10
      });
    }

    // List products with filters
    let where: any = { isActive: true };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice as string);
      if (maxPrice) where.price.lte = parseInt(maxPrice as string);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    // Add average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const reviews = await prisma.review.findMany({
          where: { productId: product.id },
          select: { rating: true }
        });

        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        return {
          ...product,
          reviewCount: product._count.reviews,
          averageRating: Math.round(averageRating * 10) / 10
        };
      })
    );

    res.status(200).json({
      products: productsWithRatings,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
