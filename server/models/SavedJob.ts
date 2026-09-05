import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedJob extends Document {
  userId: string;
  opportunityId: string;
  createdAt: Date;
}

const SavedJobSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  opportunityId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

SavedJobSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export default mongoose.models.SavedJob || mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);
