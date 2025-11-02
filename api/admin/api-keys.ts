import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // List all API keys
      const apiKeys = await prisma.apiKey.findMany({
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(apiKeys);
    } else if (req.method === 'POST') {
      // Generate new API key
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Generate secure random key
      const key = crypto.randomBytes(32).toString('hex');

      const apiKey = await prisma.apiKey.create({
        data: {
          key,
          name,
          description: description || '',
          isActive: true
        }
      });

      res.status(201).json(apiKey);
    } else if (req.method === 'DELETE') {
      // Delete API key
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'API key ID is required' });
      }

      await prisma.apiKey.delete({
        where: { id }
      });

      res.status(200).json({ success: true });
    } else if (req.method === 'PATCH') {
      // Toggle API key status
      const { id } = req.query;
      const { isActive } = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'API key ID is required' });
      }

      const apiKey = await prisma.apiKey.update({
        where: { id },
        data: { isActive }
      });

      res.status(200).json(apiKey);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
