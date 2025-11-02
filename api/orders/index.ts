import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Verify JWT token
const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  try {
    // Create order
    if (action === 'create' || req.method === 'POST') {
      // Verify authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const userId = decoded.userId;

      const {
        items,
        shippingAddress,
        paymentMethod,
        customerName,
        customerEmail,
        customerPhone,
        notes
      } = req.body;

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
          });
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        });
      }

      const shipping = subtotal >= 1000 ? 0 : 50;
      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + shipping + tax;

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      // Create order
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber,
          subtotal,
          shipping,
          tax,
          total,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          shippingAddress: JSON.stringify(shippingAddress),
          customerName: customerName || user?.name || '',
          customerEmail: customerEmail || user?.email || '',
          customerPhone: customerPhone || '',
          notes: notes || null,
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

      return res.status(201).json(order);
    }

    // Track order
    if (action === 'track') {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { orderNumber, orderId } = req.query;
      const searchValue = (orderNumber || orderId) as string;

      if (!searchValue) {
        return res.status(400).json({ error: 'Order number or order ID is required' });
      }

      // Define common include clause for both queries
      const includeClause = {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true
              }
            }
          }
        }
      };

      // Try to find order by orderNumber first
      let order = await prisma.order.findUnique({
        where: { orderNumber: searchValue },
        include: includeClause
      });

      // If not found by orderNumber, try by ID (convert to string as ID is string type)
      if (!order) {
        order = await prisma.order.findUnique({
          where: { id: searchValue },
          include: includeClause
        });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      let shippingAddress = null;
      try {
        shippingAddress = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
      } catch (error) {
        console.error('Error parsing shipping address:', error);
      }

      return res.status(200).json({
        ...order,
        shippingAddress
      });
    }

    // My orders
    if (action === 'my-orders' || req.method === 'GET') {
      // Verify authentication
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const userId = decoded.userId;

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const ordersWithParsedAddress = orders.map(order => {
        let shippingAddress = null;
        try {
          shippingAddress = typeof order.shippingAddress === 'string'
            ? JSON.parse(order.shippingAddress)
            : order.shippingAddress;
        } catch (error) {
          console.error('Error parsing shipping address:', error);
        }

        return {
          ...order,
          shippingAddress
        };
      });

      return res.status(200).json(ordersWithParsedAddress);
    }

    res.status(400).json({ error: 'Invalid action parameter' });
  } catch (error) {
    console.error('Order API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
