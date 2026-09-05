import mongoose from 'mongoose';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { sampleOpportunities } from '../data/sampleOpportunities.js';

let isMongoConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('[NearWork DB] No MONGODB_URI provided in environment. Using in-memory store for 100% functional, demo-ready persistence.');
    isMongoConnected = false;
    return false;
  }

  try {
    console.log('[NearWork DB] Attempting connection to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[NearWork DB] MongoDB connected successfully!');

    // Seed sample opportunities if collection is empty
    await seedMongoDatabase();
    return true;
  } catch (error: any) {
    console.warn(`[NearWork DB] MongoDB connection failed: ${error?.message || error}. Falling back smoothly to in-memory store.`);
    isMongoConnected = false;
    return false;
  }
}

async function seedMongoDatabase() {
  try {
    const oppCount = await Opportunity.countDocuments();
    if (oppCount === 0) {
      console.log('[NearWork DB] Seeding initial sample opportunities into MongoDB...');
      // Remove _id string so Mongoose generates ObjectId or keep as string
      const sanitizedOpps = sampleOpportunities.map(({ _id, ...rest }) => rest);
      await (Opportunity as any).insertMany(sanitizedOpps as any);
      console.log(`[NearWork DB] Successfully seeded ${sanitizedOpps.length} opportunities into MongoDB.`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: "Sailaja Kotla",
        email: "kotlasailaja2006@gmail.com",
        education: "B.Tech Final Year (Computer Science Engineering)",
        skills: ["Python", "SQL", "HTML", "CSS"],
        preferredLocation: "Visakhapatnam",
        preferredCategory: "Software Development"
      });
      console.log('[NearWork DB] Seeded initial demo user into MongoDB.');
    }
  } catch (err) {
    console.error('[NearWork DB] Error during auto-seeding:', err);
  }
}

export function getIsMongoConnected(): boolean {
  return isMongoConnected;
}
