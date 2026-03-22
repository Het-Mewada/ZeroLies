import { Router } from 'express';
import StudySession from '../models/StudySession.js';
import { getOrCreateLog } from '../models/DailyLog.js';
import { calculateScore, isDaySuccess } from '../utils/scoring.js';
import { burstProtection } from '../middleware/burstProtection.js';
import { getTodayStr } from '../utils/time.js';

const router = Router();

// Start a study session
router.post('/start', async (req, res) => {
  try {
    const today = getTodayStr();

    // Check if there's already an active session
    const active = await StudySession.findOne({ date: today, isActive: true });
    if (active) {
      return res.status(400).json({ error: 'A study session is already active.', session: active });
    }

    const session = await StudySession.create({
      date: today,
      startTime: new Date(),
    });

    res.json({ message: 'Study session started.', session });
  } catch (error) {
    console.error('Study start error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Stop a study session
router.post('/stop', async (req, res) => {
  try {
    const today = getTodayStr();
    const session = await StudySession.findOne({ date: today, isActive: true });

    if (!session) {
      return res.status(400).json({ error: 'No active study session.' });
    }

    const endTime = new Date();
    const durationMs = endTime - session.startTime;
    const durationMin = durationMs / (1000 * 60);

    session.endTime = endTime;
    session.duration = Math.round(durationMin);
    session.isActive = false;

    // Validate: session must be >= 25 minutes
    if (durationMin < 2) {
      session.isValid = false;
      await session.save();
      return res.json({
        message: 'Session too short (< 2min). Not counted.',
        session,
        isValid: false,
      });
    }

    // Validate: check if snapshots exist at every 2 min interval (testing — change back to 5 for prod)
    const SNAPSHOT_INTERVAL = 2;
    const expectedSnapshots = Math.floor(durationMin / SNAPSHOT_INTERVAL);
    if (session.snapshots.length < expectedSnapshots) {
      session.isValid = false;
      await session.save();
      return res.json({
        message: `Missing snapshots. Expected ${expectedSnapshots}, got ${session.snapshots.length}. Session invalid.`,
        session,
        isValid: false,
      });
    }

    session.isValid = true;
    await session.save();

    // Check total valid minutes today
    const allSessions = await StudySession.find({ date: today, isValid: true });
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);

    // If total >= 180 min, mark gate_study as completed
    if (totalMinutes >= 180) {
      const log = await getOrCreateLog(today);
      if (log.tasks.gate_study.status !== 'completed') {
        log.tasks.gate_study = {
          status: 'completed',
          completedAt: new Date(),
          proof: { imageUrl: null, gps: { lat: null, lng: null }, exifTimestamp: null },
        };

        const tasksObj = {};
        for (const key of Object.keys(log.tasks.toObject ? log.tasks.toObject() : log.tasks)) {
          tasksObj[key] = log.tasks[key];
        }
        log.score = calculateScore(tasksObj);
        log.isSuccess = isDaySuccess(log.score);
        await log.save();
      }
    }

    res.json({
      message: 'Session completed successfully.',
      session,
      totalMinutesToday: totalMinutes,
      isValid: true,
    });
  } catch (error) {
    console.error('Study stop error:', error);
    res.status(500).json({ error: 'Failed to stop session' });
  }
});

// Add study snapshot
router.post('/snapshot', async (req, res) => {
  try {
    const today = getTodayStr();
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Snapshot image URL required.' });
    }

    const session = await StudySession.findOne({ date: today, isActive: true });
    if (!session) {
      return res.status(400).json({ error: 'No active study session.' });
    }

    session.snapshots.push({ url: imageUrl, takenAt: new Date() });
    await session.save();

    res.json({
      message: 'Snapshot recorded.',
      snapshotCount: session.snapshots.length,
    });
  } catch (error) {
    console.error('Snapshot error:', error);
    res.status(500).json({ error: 'Failed to record snapshot' });
  }
});

// Get today's study data
router.get('/today', async (req, res) => {
  try {
    const today = getTodayStr();
    const sessions = await StudySession.find({ date: today }).sort({ startTime: -1 });
    const validSessions = sessions.filter(s => s.isValid);
    const totalMinutes = validSessions.reduce((sum, s) => sum + s.duration, 0);
    const activeSession = sessions.find(s => s.isActive);

    res.json({
      sessions,
      totalMinutes,
      goal: 180,
      remaining: Math.max(0, 180 - totalMinutes),
      isGoalMet: totalMinutes >= 180,
      activeSession: activeSession || null,
    });
  } catch (error) {
    console.error('Study today error:', error);
    res.status(500).json({ error: 'Failed to get study data' });
  }
});

export default router;
