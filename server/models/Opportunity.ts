import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  company: string;
  location: string;
  category: string;
  type: string;
  skills: string[];
  salary: string;
  experience: string;
  eligibility: string;
  description: string;
  deadline: string;
  applyLink: string;
  featured: boolean;
  createdAt: Date;
}

const OpportunitySchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  skills: [{ type: String, trim: true }],
  salary: { type: String, default: 'Competitive' },
  experience: { type: String, default: 'Fresher' },
  eligibility: { type: String, default: 'Graduate' },
  description: { type: String, required: true },
  deadline: { type: String, default: 'Open until filled' },
  applyLink: { type: String, required: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Opportunity || mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
