import mongoose, { type Model } from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  isAdmin: { type: Boolean, default: false },
  plan: { type: String, default: 'free' },
  preferredModel: { type: String, default: 'gemini-2.5-flash' },
  avatarDataUrl: { type: String },
  profileStrength: { type: Number, default: 25 },
  phone: { type: String },
  location: { type: String },
  targetRole: { type: String },
  skills: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const User = (mongoose.models.User || mongoose.model('User', userSchema)) as Model<any>;
