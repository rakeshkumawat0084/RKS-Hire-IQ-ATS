import mongoose, { type Model } from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  score: { type: Number },
  sections: { type: Map, of: Number },
  strengths: [String],
  improvements: [String],
  missingKeywords: [String],
  createdAt: { type: Date, default: Date.now },
});

export const Resume = (mongoose.models.Resume || mongoose.model('Resume', resumeSchema)) as Model<any>;
