import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const userId = decoded.userId

    if (req.method === 'GET') {
      // Get user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          isVerified: true,
          role: true,
          createdAt: true,
          addresses: true,
          _count: {
            select: {
              orders: true,
              favorites: true,
              reviews: true
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.status(200).json(user)
    } else if (req.method === 'PUT') {
      // Update user profile
      const { name, phone } = req.body

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone })
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          isVerified: true,
          role: true
        }
      })

      res.status(200).json(updatedUser)
    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('User profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
