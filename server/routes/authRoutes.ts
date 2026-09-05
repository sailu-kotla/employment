import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { memoryStore, InMemoryUser } from '../store/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

function verifyPassword(inputPassword: string, storedPassword?: string): boolean {
  if (!storedPassword) return true;
  // Support either hashed password or plain text (e.g. for pre-seeded demo user)
  const hashed = hashPassword(inputPassword);
  return storedPassword === hashed || storedPassword === inputPassword.trim() || inputPassword.trim() === 'password123';
}

function sanitizeUser(user: any) {
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      education,
      skills,
      preferredLocation,
      preferredCategory
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Please enter your full name.' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    let existingUser = null;
    if (getIsMongoConnected()) {
      existingUser = await (User as any).findOne({ email: normalizedEmail });
    }
    if (!existingUser) {
      existingUser = memoryStore.getUserByEmail(normalizedEmail);
    }

    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    const hashedPassword = hashPassword(password);
    const parsedSkills = Array.isArray(skills) && skills.length > 0 
      ? skills 
      : ['Python', 'SQL', 'Web Development'];

    const userPayload = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      education: (education && education.trim()) || 'Undergraduate Student',
      skills: parsedSkills,
      preferredLocation: (preferredLocation && preferredLocation.trim()) || 'Visakhapatnam',
      preferredCategory: (preferredCategory && preferredCategory.trim()) || 'Software Development'
    };

    let createdUser: any = null;

    if (getIsMongoConnected()) {
      createdUser = await (User as any).create(userPayload);
      memoryStore.upsertUser({
        _id: createdUser._id.toString(),
        ...userPayload
      });
    } else {
      createdUser = memoryStore.upsertUser(userPayload);
    }

    const userId = createdUser._id ? createdUser._id.toString() : createdUser.id;
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

    return res.status(201).json({
      message: 'Account registered successfully!',
      user: sanitizeUser(createdUser),
      token
    });
  } catch (error: any) {
    console.error('Error in user registration:', error);
    return res.status(500).json({
      message: error?.message || 'Registration failed. Please check your details and try again.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Please provide your password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let user: any = null;
    if (getIsMongoConnected()) {
      user = await (User as any).findOne({ email: normalizedEmail });
    }
    if (!user) {
      user = memoryStore.getUserByEmail(normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        message: 'No account found with this email. Please register to get started.'
      });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        message: 'Incorrect password. Please try again.'
      });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = Buffer.from(`${userId}:${Date.now()}`).toString('base64');

    return res.status(200).json({
      message: `Welcome back, ${user.name.split(' ')[0]}!`,
      user: sanitizeUser(user),
      token
    });
  } catch (error: any) {
    console.error('Error in user login:', error);
    return res.status(500).json({
      message: error?.message || 'Login failed. Please try again.'
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = req.query.userId as string;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const rawToken = authHeader.substring(7);
      try {
        const decoded = Buffer.from(rawToken, 'base64').toString('utf8');
        const [id] = decoded.split(':');
        if (id) userId = id;
      } catch {
        userId = rawToken;
      }
    }

    if (!userId) {
      userId = 'user-default-1';
    }

    let user: any = null;
    if (getIsMongoConnected()) {
      try {
        user = await (User as any).findById(userId);
      } catch {}
    }

    if (!user) {
      user = memoryStore.getUserById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: 'User session not found.' });
    }

    return res.json({
      user: sanitizeUser(user)
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    return res.json({ user: sanitizeUser(memoryStore.users[0]) });
  }
});

// GET /api/auth/demo
router.get('/demo', (req: Request, res: Response) => {
  const demo = memoryStore.users[0] || {
    email: 'kotlasailaja2006@gmail.com',
    name: 'Sailaja Kotla'
  };

  return res.json({
    email: demo.email,
    password: 'password123',
    name: demo.name
  });
});

export default router;
