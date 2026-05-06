import mongoose, { type Model } from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  type: { type: String },
  message: { type: String },
  interests: [String],
  status: { type: String, default: 'new' },
  priority: { type: String, default: 'medium' },
  source: { type: String, default: 'contact_form' },
  replyMessage: { type: String },
  repliedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const Lead = (mongoose.models.Lead || mongoose.model('Lead', leadSchema)) as Model<any>;
