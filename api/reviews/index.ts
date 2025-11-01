import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

const verifyToken = (req: VercelRequest): JWTPayload | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Get reviews for a product
    if (req.method === 'GET') {
      const { productId } = req.query;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const reviews = await prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

      return res.status(200).json({
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
      });
    }

    // POST - Create a new review (requires authentication)
    if (req.method === 'POST') {
      const payload = verifyToken(req);
      if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { productId, rating, comment } = req.body;

      if (!productId || !rating) {
        return res.status(400).json({ error: 'Product ID and rating are required' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Check if user already reviewed this product
      const existingReview = await prisma.review.findFirst({
        where: {
          productId,
          userId: payload.userId,
        },
      });

      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this product' });
      }

      const review = await prisma.review.create({
        data: {
          productId,
          userId: payload.userId,
          rating,
          comment: comment || '',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json(review);
    }

    // PUT - Update a review (requires authentication and ownership)
    if (req.method === 'PUT') {
      const payload = verifyToken(req);
      if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { reviewId, rating, comment } = req.body;

      if (!reviewId) {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      // Check if review exists and belongs to user
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (existingReview.userId !== payload.userId) {
        return res.status(403).json({ error: 'You can only edit your own reviews' });
      }

      const updateData: any = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        updateData.rating = rating;
      }
      if (comment !== undefined) {
        updateData.comment = comment;
      }

      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return res.status(200).json(updatedReview);
    }

    // DELETE - Delete a review (requires authentication and ownership)
    if (req.method === 'DELETE') {
      const payload = verifyToken(req);
      if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { reviewId } = req.query;

      if (!reviewId || typeof reviewId !== 'string') {
        return res.status(400).json({ error: 'Review ID is required' });
      }

      // Check if review exists and belongs to user
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (existingReview.userId !== payload.userId) {
        return res.status(403).json({ error: 'You can only delete your own reviews' });
      }

      await prisma.review.delete({
        where: { id: reviewId },
      });

      return res.status(200).json({ message: 'Review deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Reviews API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
