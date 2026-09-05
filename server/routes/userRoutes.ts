import { Router, Request, Response } from 'express';
import User from '../models/User.js';
import { memoryStore } from '../store/inMemoryStore.js';
import { getIsMongoConnected } from '../config/db.js';

const router = Router();

function validateUserData(body: any) {
  const errors: string[] = [];
  if (!body.name || !body.name.trim()) errors.push('Please enter your name.');
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email.trim())) errors.push('Please enter a valid email.');
  if (!body.education || !body.education.trim()) errors.push('Please enter your education background.');
  if (!body.skills || !Array.isArray(body.skills) || body.skills.length === 0) errors.push('Please select at least one skill.');
  if (!body.preferredLocation || !body.preferredLocation.trim()) errors.push('Please select a preferred location.');
  if (!body.preferredCategory || !body.preferredCategory.trim()) errors.push('Please select a preferred category.');
  return errors;
}

// GET /api/users/:id - Get user profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!getIsMongoConnected()) {
      const user = memoryStore.getUserById(id);
      return res.json(user);
    }

    let user = null;
    try {
      user = await (User as any).findById(id);
    } catch {
      // not a valid ObjectId
    }

    if (!user) {
      user = memoryStore.getUserById(id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error: any) {
    console.error('Error getting user:', error);
    return res.json(memoryStore.users[0]);
  }
});

// POST /api/users - Create user profile
router.post('/', async (req: Request, res: Response) => {
  try {
    const errors = validateUserData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const { name, email, education, skills, preferredLocation, preferredCategory } = req.body;

    if (!getIsMongoConnected()) {
      const savedUser = memoryStore.upsertUser({
        name,
        email,
        education,
        skills,
        preferredLocation,
        preferredCategory
      });
      return res.status(200).json({ message: 'Profile updated successfully.', user: savedUser });
    }

    // Try finding existing by email or create new
    let user = await (User as any).findOne({ email: email.toLowerCase().trim() });
    if (user) {
      user.name = name;
      user.education = education;
      user.skills = skills;
      user.preferredLocation = preferredLocation;
      user.preferredCategory = preferredCategory;
      await user.save();
    } else {
      user = await (User as any).create({
        name,
        email,
        education,
        skills,
        preferredLocation,
        preferredCategory
      });
    }

    // Keep memoryStore in sync
    memoryStore.upsertUser({
      _id: user._id.toString(),
      name,
      email,
      education,
      skills,
      preferredLocation,
      preferredCategory
    });

    return res.status(200).json({ message: 'Profile updated successfully.', user });
  } catch (error: any) {
    console.error('Error saving user profile:', error);
    // Fallback to memoryStore
    const savedUser = memoryStore.upsertUser(req.body);
    return res.status(200).json({ message: 'Profile updated successfully.', user: savedUser });
  }
});

// PUT /api/users/:id - Update user profile
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const errors = validateUserData(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const { id } = req.params;
    const { name, email, education, skills, preferredLocation, preferredCategory } = req.body;

    if (!getIsMongoConnected()) {
      const updated = memoryStore.upsertUser({
        _id: id,
        name,
        email,
        education,
        skills,
        preferredLocation,
        preferredCategory
      });
      return res.json({ message: 'Profile updated successfully.', user: updated });
    }

    let user = null;
    try {
      user = await (User as any).findByIdAndUpdate(
        id,
        { name, email, education, skills, preferredLocation, preferredCategory },
        { new: true, runValidators: true }
      );
    } catch {
      // not a mongo ObjectId
    }

    if (!user) {
      user = memoryStore.upsertUser({
        _id: id,
        name,
        email,
        education,
        skills,
        preferredLocation,
        preferredCategory
      });
    }

    return res.json({ message: 'Profile updated successfully.', user });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    const updated = memoryStore.upsertUser({ _id: req.params.id, ...req.body });
    return res.json({ message: 'Profile updated successfully.', user: updated });
  }
});

export default router;
