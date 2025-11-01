import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware to verify admin token
const verifyAdmin = (req: VercelRequest) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, JWT_SECRET) as any
  
  if (decoded.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }

  return decoded
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // Verify admin authentication
    verifyAdmin(req)

    if (req.method === 'GET') {
      // Get all products with pagination for admin
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const search = req.query.search as string
      const category = req.query.category as string
      const skip = (page - 1) * limit

      const where: any = {}
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (category) {
        where.category = category
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count({ where })
      ])

      return res.status(200).json({
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

    if (req.method === 'POST') {
      // Create new product
      const { id, name, description, price, basePrice, category, image, images, sizes, colors, stock } = req.body

      if (!id || !name || !price || !category) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const product = await prisma.product.create({
        data: {
          id,
          name,
          description: description || '',
          price: parseFloat(price),
          basePrice: basePrice ? parseFloat(basePrice) : parseFloat(price),
          category,
          image: image || '/placeholder.svg',
          images: typeof images === 'string' ? images : JSON.stringify(images || []),
          sizes: typeof sizes === 'string' ? sizes : JSON.stringify(sizes || []),
          colors: typeof colors === 'string' ? colors : JSON.stringify(colors || []),
          stock: stock !== undefined ? parseInt(stock) : 0
        }
      })

      return res.status(201).json(product)
    }

    if (req.method === 'PUT') {
      // Update product
      const { id, name, description, price, basePrice, category, image, images, sizes, colors, stock } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Product ID required' })
      }

      const updateData: any = {}
      
      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (price !== undefined) updateData.price = parseFloat(price)
      if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice)
      if (category !== undefined) updateData.category = category
      if (image !== undefined) updateData.image = image
      if (images !== undefined) updateData.images = typeof images === 'string' ? images : JSON.stringify(images)
      if (sizes !== undefined) updateData.sizes = typeof sizes === 'string' ? sizes : JSON.stringify(sizes)
      if (colors !== undefined) updateData.colors = typeof colors === 'string' ? colors : JSON.stringify(colors)
      if (stock !== undefined) updateData.stock = parseInt(stock)

      const product = await prisma.product.update({
        where: { id },
        data: updateData
      })

      return res.status(200).json(product)
    }

    if (req.method === 'DELETE') {
      // Delete product
      const { id } = req.query

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Product ID required' })
      }

      await prisma.product.delete({
        where: { id }
      })

      return res.status(200).json({ message: 'Product deleted successfully' })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error: any) {
    console.error('Admin products error:', error)
    
    if (error.message === 'No token provided' || error.message === 'Admin access required') {
      return res.status(403).json({ error: error.message })
    }
    
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
