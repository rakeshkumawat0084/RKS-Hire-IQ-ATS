import mongoose, { type Model } from "mongoose";

const SkillsLabResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now },
  formData: {
    education: String,
    skills: String,
    interests: String,
    location: String
  },
  result: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const SkillsLabResult = (mongoose.models.SkillsLabResult || mongoose.model("SkillsLabResult", SkillsLabResultSchema)) as Model<any>;
