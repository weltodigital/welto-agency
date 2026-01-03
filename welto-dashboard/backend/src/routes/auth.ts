import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: number;
    username: string;
    role: string;
    client_id?: string;
  };
}

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.getUser({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        client_id: user.client_id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        client_id: user.client_id
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Refresh token
router.post('/refresh', authenticateToken, (req: AuthRequest, res) => {
  const newToken = jwt.sign(
    {
      id: req.user!.id,
      username: req.user!.username,
      role: req.user!.role,
      client_id: req.user!.client_id
    },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  res.json({ token: newToken });
});

export default router;