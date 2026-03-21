import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: null },
  duration: { type: Number, default: 0 }, // minutes
  snapshots: [{ url: String, takenAt: Date }],
  isValid: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const StudySession = mongoose.model('StudySession', studySessionSchema);
export default StudySession;
