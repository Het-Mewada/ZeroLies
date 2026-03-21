import mongoose from 'mongoose';

const taskEntrySchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  completedAt: { type: Date, default: null },
  proof: {
    imageUrl: { type: String, default: null },
    gps: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    exifTimestamp: { type: Date, default: null },
  },
}, { _id: false });

const dailyLogSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  tasks: {
    nofap:           { type: taskEntrySchema, default: () => ({}) },
    gate_study:      { type: taskEntrySchema, default: () => ({}) },
    gym:             { type: taskEntrySchema, default: () => ({}) },
    night_walk:      { type: taskEntrySchema, default: () => ({}) },
    prayer:          { type: taskEntrySchema, default: () => ({}) },
    skincare_morning:{ type: taskEntrySchema, default: () => ({}) },
    skincare_night:  { type: taskEntrySchema, default: () => ({}) },
    sleep:           { type: taskEntrySchema, default: () => ({}) },
    wake:            { type: taskEntrySchema, default: () => ({}) },
  },
  score: { type: Number, default: 0 },
  isSuccess: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

// Get or create today's log
export async function getOrCreateLog(dateStr) {
  let log = await DailyLog.findOne({ date: dateStr });
  if (!log) {
    log = await DailyLog.create({ date: dateStr });
  }
  return log;
}

export default DailyLog;
