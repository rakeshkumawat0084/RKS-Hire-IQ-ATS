import mongoose, { type Model } from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  difficulty: { type: String },
  questionCount: { type: Number },
  answers: [String],
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now },
});

export const Interview = (mongoose.models.Interview || mongoose.model('Interview', interviewSchema)) as Model<any>;
