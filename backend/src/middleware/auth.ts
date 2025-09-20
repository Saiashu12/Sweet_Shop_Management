import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('No token provided, authorization denied', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AppError('Token is not valid', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError('Token is not valid', 401);
  }
});