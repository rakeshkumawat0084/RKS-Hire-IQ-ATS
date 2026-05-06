import mongoose, { type Model } from 'mongoose';

const EmailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, default: 'general' },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
});

export const EmailTemplate = (mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema)) as Model<any>;
