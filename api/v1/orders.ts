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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, customerEmail, customerName, customerPhone, items, shippingAddress, paymentMethod } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Check if user exists or create guest user
    let finalUserId = userId;
    if (!userId && customerEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail }
      });

      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        const guestUser = await prisma.user.create({
          data: {
            email: customerEmail,
            name: customerName || 'Guest',
            password: '',
            role: 'USER'
          }
        });
        finalUserId = guestUser.id;
      }
    }

    // Validate stock and calculate total
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
        return res.status(409).json({ 
          error: `Insufficient stock for product: ${product.name}` 
        });
      }

      totalAmount += item.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
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

    return res.status(201).json({
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
    console.error('Orders API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
