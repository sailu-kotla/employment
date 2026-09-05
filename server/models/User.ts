import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  education: string;
  skills: string[];
  preferredLocation: string;
  preferredCategory: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  password: { type: String, default: 'password123' },
  education: { type: String, required: true, trim: true },
  skills: [{ type: String, trim: true }],
  preferredLocation: { type: String, default: 'Visakhapatnam' },
  preferredCategory: { type: String, default: 'Software Development' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
