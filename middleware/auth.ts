import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'AB26SuperviseSecretKey_Very_Strong_123');
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
