import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
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

    const {
      items,
      shippingAddress,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      notes
    } = req.body

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` })
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      })
    }

    // Calculate shipping and tax (Indian context)
    const shipping = subtotal >= 500 ? 0 : 50 // Free shipping above ₹500
    const tax = subtotal * 0.18 // 18% GST
    const total = subtotal + shipping + tax

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        status: 'PENDING',
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    // Create order tracking
    await prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: 'CREATED',
        currentStep: 0,
        trackingSteps: {
          create: [
            {
              step: 'Order Placed',
              description: 'Your order has been received and is being processed',
              isCompleted: true
            }
          ]
        },
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Order creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
