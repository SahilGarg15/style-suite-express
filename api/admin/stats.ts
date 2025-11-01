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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
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
      // Get dashboard statistics
      const [
        totalProducts,
        totalUsers,
        totalOrders,
        lowStockProducts,
        orders,
        recentOrders
      ] = await Promise.all([
        prisma.product.count(),
        prisma.user.count(),
        prisma.order.count(),
        prisma.product.count({
          where: {
            stock: {
              lt: 10
            }
          }
        }),
        prisma.order.findMany({
          select: {
            total: true,
            createdAt: true,
            status: true
          }
        }),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            items: {
              select: {
                quantity: true
              }
            }
          }
        })
      ])

      // Calculate revenue
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      
      // Calculate pending orders
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length
      
      // Calculate revenue for last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentRevenue = orders
        .filter(o => new Date(o.createdAt) >= sevenDaysAgo)
        .reduce((sum, order) => sum + order.total, 0)

      return res.status(200).json({
        totalProducts,
        totalUsers,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        totalRevenue,
        recentRevenue,
        recentOrders
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error: any) {
    console.error('Admin stats error:', error)
    
    if (error.message === 'No token provided' || error.message === 'Admin access required') {
      return res.status(403).json({ error: error.message })
    }
    
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
