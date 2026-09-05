import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatusType = 'Saved' | 'Applied' | 'Interview' | 'Selected' | 'Rejected';

export interface IApplication extends Document {
  userId: string;
  opportunityId: string;
  status: ApplicationStatusType;
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  opportunityId: { type: String, required: true },
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
