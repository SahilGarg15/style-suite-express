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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      userId, 
      items, 
      shippingAddress, 
      paymentMethod = 'COD',
      customerName,
      customerEmail,
      customerPhone
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        size: item.size || null,
        color: item.color || null
      });
    }

    // Create or find user if userId provided
    let finalUserId = userId;
    if (!userId && customerEmail) {
      // Create guest user or find existing
      let user = await prisma.user.findUnique({
        where: { email: customerEmail }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: customerEmail,
            name: customerName || 'Guest',
            phone: customerPhone || null,
            password: Math.random().toString(36).slice(-8), // Random password for guest
            isVerified: false
          }
        });
      }
      finalUserId = user.id;
    }

    if (!finalUserId) {
      return res.status(400).json({ error: 'User ID or customer email is required' });
    }

    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const order = await prisma.order.create({
      data: {
        userId: finalUserId,
        orderNumber,
        subtotal: totalAmount,
        shipping: 0,
        tax: 0,
        total: totalAmount,
        customerName: customerName || 'Guest',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        status: 'PENDING',
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        shippingAddress: JSON.stringify(shippingAddress),
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
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        items: order.items
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
