import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error();
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
}; 