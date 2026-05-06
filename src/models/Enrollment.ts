import mongoose, { type Model } from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  courseTitle: { type: String, required: true },
  enrolledAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  status: { type: String, enum: ["enrolled", "completed"], default: "enrolled" },
  completedModules: [{ type: String }]
}, { timestamps: true });

export const Enrollment = (mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema)) as Model<any>;
