import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }

  next();
};