import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderNumber } = req.query

    if (!orderNumber || typeof orderNumber !== 'string') {
      return res.status(400).json({ error: 'Order number is required' })
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
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
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const orderWithParsedData = {
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
    }

    res.status(200).json(orderWithParsedData)
  } catch (error) {
    console.error('Order track error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
