import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { category, search, sortBy, minPrice, maxPrice, limit = '50', offset = '0' } = req.query

    let where: any = {
      isActive: true
    }

    // Filter by category
    if (category && category !== 'all') {
      where.category = category
    }

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseInt(minPrice as string)
      if (maxPrice) where.price.lte = parseInt(maxPrice as string)
    }

    // Sorting
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'price-asc') orderBy = { price: 'asc' }
    if (sortBy === 'price-desc') orderBy = { price: 'desc' }
    if (sortBy === 'name') orderBy = { name: 'asc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        include: {
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // Calculate average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const ratings = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true }
        })

        return {
          ...product,
          images: JSON.parse(product.images),
          sizes: JSON.parse(product.sizes),
          colors: product.colors ? JSON.parse(product.colors) : [],
          averageRating: ratings._avg.rating || 0,
          reviewCount: product._count.reviews
        }
      })
    )

    res.status(200).json({
      products: productsWithRatings,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
