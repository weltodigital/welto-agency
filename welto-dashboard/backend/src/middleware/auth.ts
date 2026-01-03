import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    client_id?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireClientAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  const { client_id } = req.params;

  // Admin can access any client data
  if (req.user?.role === 'admin') {
    return next();
  }

  // Client can only access their own data
  if (req.user?.role === 'client' && req.user?.client_id === client_id) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied' });
};