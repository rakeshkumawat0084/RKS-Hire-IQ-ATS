import mongoose, { type Model } from 'mongoose';

const settingsSchema = new mongoose.Schema({
  analysisModel: { type: String, default: 'gemini-2.5-flash' },
  systemPrompt: { type: String, default: 'You are the RKS AI career coach. Be professional, direct, and providing deep actionable insights...' },
  brandColor: { type: String, default: '#6366f1' },
  platformName: { type: String, default: 'RKS HireIQ' },
  updatedAt: { type: Date, default: Date.now }
});

export const Settings = (mongoose.models.Settings || mongoose.model('Settings', settingsSchema)) as Model<any>;
