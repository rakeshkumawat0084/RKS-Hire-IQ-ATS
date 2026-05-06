import mongoose, { type Model } from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['draft', 'sent', 'scheduled'], default: 'draft' },
  recipientsCount: { type: Number, default: 0 },
  sentAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export const Campaign = (mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema)) as Model<any>;
