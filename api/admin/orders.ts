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
      // Get all orders with pagination
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const status = req.query.status as string
      const skip = (page - 1) * limit

      const where: any = {}
      
      if (status) {
        where.status = status
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            items: {
              include: {
                product: true
              }
            },
            tracking: true
          }
        }),
        prisma.order.count({ where })
      ])

      return res.status(200).json({
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

    if (req.method === 'PUT') {
      // Update order status
      const { orderId, status } = req.body

      if (!orderId || !status) {
        return res.status(400).json({ error: 'Order ID and status required' })
      }

      const updateData: any = { status }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: true
            }
          },
          tracking: true
        }
      })

      // Update or create tracking information
      const trackingStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 
                            status === 'PROCESSING' ? 'PROCESSING' :
                            status === 'SHIPPED' ? 'SHIPPED' :
                            status === 'DELIVERED' ? 'DELIVERED' : 'CREATED'

      await prisma.orderTracking.upsert({
        where: { orderId },
        update: {
          status: trackingStatus as any,
          updatedAt: new Date()
        },
        create: {
          orderId,
          status: trackingStatus as any
        }
      })

      return res.status(200).json(order)
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error: any) {
    console.error('Admin orders error:', error)
    
    if (error.message === 'No token provided' || error.message === 'Admin access required') {
      return res.status(403).json({ error: error.message })
    }
    
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
