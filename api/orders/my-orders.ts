import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const userId = decoded.userId

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        tracking: {
          include: {
            trackingSteps: {
              orderBy: { timestamp: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const ordersWithParsedData = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images),
          sizes: JSON.parse(item.product.sizes),
          colors: JSON.parse(item.product.colors)
        }
      }))
    }))

    res.status(200).json(ordersWithParsedData)
  } catch (error) {
    console.error('Orders fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
