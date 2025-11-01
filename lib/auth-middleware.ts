import type { VercelRequest, VercelResponse } from '@vercel/node'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends VercelRequest {
  userId?: string
  user?: {
    id: string
    email: string
    role: string
  }
}

/**
 * Verify JWT token from Authorization header
 * @param token - JWT token string
 * @returns Decoded user data or null
 */
export const verifyToken = (token: string | undefined) => {
  if (!token) return null
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    return null
  }
}

/**
 * Extract and verify JWT token from request headers
 * @param req - Vercel request object
 * @returns Decoded user data or null
 */
export const getUserFromRequest = (req: VercelRequest) => {
  const authHeader = req.headers.authorization as string | undefined
  const token = authHeader?.replace('Bearer ', '')
  return verifyToken(token)
}

/**
 * Check if request has valid authentication
 * @param req - Vercel request object
 * @returns true if authenticated, false otherwise
 */
export const isAuthenticated = (req: VercelRequest): boolean => {
  const user = getUserFromRequest(req)
  return user !== null
}

/**
 * Require authentication middleware
 * Returns 401 if not authenticated
 */
export const requireAuth = (req: VercelRequest, res: VercelResponse) => {
  const user = getUserFromRequest(req)
  
  if (!user) {
    res.status(401).json({ error: 'Authentication required' })
    return null
  }
  
  return user
}
