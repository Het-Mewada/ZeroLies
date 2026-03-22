import { Router } from 'express';
import DailyLog, { getOrCreateLog } from '../models/DailyLog.js';
import { calculateScore, isDaySuccess } from '../utils/scoring.js';
import { validateTimeWindow, validateGps } from '../middleware/timeValidation.js';
import { burstProtection } from '../middleware/burstProtection.js';
import { getISTDate, getTodayStr, getYesterdayStr } from '../utils/time.js';

const router = Router();

// Submit a task
router.post('/submit', burstProtection, validateTimeWindow, async (req, res) => {
  try {
    const { taskId, proof } = req.body;
    const today = getTodayStr();
    const log = await getOrCreateLog(today);

    // Check if day is locked
    if (log.isLocked) {
      return res.status(400).json({ error: 'This day is locked. No more submissions.' });
    }

    // Check if task already completed
    const task = log.tasks[taskId];
    if (task && task.status === 'completed') {
      return res.status(400).json({ error: 'Task already completed today.' });
    }

    // Validate proof requirements per task
    const proofData = proof || {};

    // Night walk & Prayer: just require a photo (gallery upload, no GPS/EXIF)
    if (['night_walk', 'prayer'].includes(taskId)) {
      if (!proofData.imageUrl) {
        return res.status(400).json({ error: 'Photo is required.' });
      }
    }

    // Gym: camera + GPS, no EXIF requirement by spec but camera is required
    if (taskId === 'gym') {
      if (!proofData.imageUrl) {
        return res.status(400).json({ error: 'Live photo is required for gym.' });
      }
      if (!validateGps(proofData.gps)) {
        return res.status(400).json({ error: 'GPS location is required for gym.' });
      }
    }

    // Skincare: selfie required
    if (['skincare_morning', 'skincare_night'].includes(taskId)) {
      if (!proofData.imageUrl) {
        return res.status(400).json({ error: 'Selfie is required.' });
      }
    }

    // Mark task complete
    log.tasks[taskId] = {
      status: 'completed',
      completedAt: new Date(),
      proof: {
        imageUrl: proofData.imageUrl || null,
        gps: proofData.gps || { lat: null, lng: null },
        exifTimestamp: proofData.exifTimestamp ? new Date(proofData.exifTimestamp) : null,
      },
    };

    // Derived task: If prayer is completed, auto-mark nofap
    if (taskId === 'prayer') {
      log.tasks.nofap = {
        status: 'completed',
        completedAt: new Date(),
        proof: { imageUrl: null, gps: { lat: null, lng: null }, exifTimestamp: null },
      };
    }

    // Recalculate score
    const tasksObj = {};
    for (const key of Object.keys(log.tasks.toObject ? log.tasks.toObject() : log.tasks)) {
      tasksObj[key] = log.tasks[key];
    }
    log.score = calculateScore(tasksObj);
    log.isSuccess = isDaySuccess(log.score);

    await log.save();

    res.json({
      message: `${taskId} completed successfully`,
      task: log.tasks[taskId],
      score: log.score,
      isSuccess: log.isSuccess,
    });
  } catch (error) {
    console.error('Task submit error:', error);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

// Wake check-in
router.post('/wake-checkin', async (req, res) => {
  try {
    const now = new Date();
    const today = getTodayStr();
    const log = await getOrCreateLog(today);

    if (log.isLocked) {
      return res.status(400).json({ error: 'Day is locked.' });
    }

    if (log.tasks.wake.status === 'completed') {
      return res.status(400).json({ error: 'Already checked in.' });
    }

    const istNow = getISTDate();

    // Sunday excluded
    if (istNow.getUTCDay() === 0) {
      // Auto-mark as completed on Sunday
      log.tasks.wake = {
        status: 'completed',
        completedAt: new Date(),
        proof: { imageUrl: null, gps: { lat: null, lng: null }, exifTimestamp: null },
      };
    } else if (istNow.getUTCHours() < 8) {
      log.tasks.wake = {
        status: 'completed',
        completedAt: now,
        proof: { imageUrl: null, gps: { lat: null, lng: null }, exifTimestamp: null },
      };
    } else {
      log.tasks.wake = {
        status: 'failed',
        completedAt: now,
        proof: { imageUrl: null, gps: { lat: null, lng: null }, exifTimestamp: null },
      };
    }

    const tasksObj = {};
    for (const key of Object.keys(log.tasks.toObject ? log.tasks.toObject() : log.tasks)) {
      tasksObj[key] = log.tasks[key];
    }
    log.score = calculateScore(tasksObj);
    log.isSuccess = isDaySuccess(log.score);
    await log.save();

    res.json({
      status: log.tasks.wake.status,
      message: log.tasks.wake.status === 'completed' ? 'Wake check-in successful!' : 'Too late — after 8 AM.',
      score: log.score,
    });
  } catch (error) {
    console.error('Wake check-in error:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Sleep check (called when app is opened)
router.get('/sleep-check', async (req, res) => {
  try {
    const istNow = getISTDate();
    const hour = istNow.getUTCHours();
    const minute = istNow.getUTCMinutes();

    // ── 3:00 AM – 4:59 AM → HARD FAIL: mark yesterday's sleep as failed ──
    if (hour >= 3 && hour < 5) {
      // The "today" for sleep is actually yesterday (since day resets at 3:05 AM)
      const dateStr = getYesterdayStr();
      const log = await getOrCreateLog(dateStr);

      if (log.tasks.sleep.status !== 'completed') {
        log.tasks.sleep = {
          status: 'failed',
          completedAt: now,
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

      return res.json({ sleepFailed: true, sleepWarning: false, message: 'Sleep failed — app opened after 3 AM.' });
    }

    // ── 12:01 AM – 2:59 AM → SOFT WARNING only (no failure) ──
    if ((hour === 0 && minute >= 1) || (hour >= 1 && hour < 3)) {
      return res.json({ sleepFailed: false, sleepWarning: true, message: 'Time left to sleep is running low. Get to bed!' });
    }

    res.json({ sleepFailed: false, sleepWarning: false });
  } catch (error) {
    console.error('Sleep check error:', error);
    res.status(500).json({ error: 'Sleep check failed' });
  }
});

// Mark sleep as success (user can claim this before 3 AM)
router.post('/sleep-success', async (req, res) => {
  try {
    const now = new Date();
    const today = getTodayStr();
    const log = await getOrCreateLog(today);

    if (log.isLocked) {
      return res.status(400).json({ error: 'Day is locked.' });
    }

    if (log.tasks.sleep.status === 'completed') {
      return res.status(400).json({ error: 'Sleep already marked.' });
    }

    // Can only mark sleep success before 3 AM (of the next calendar day)
    // i.e., current time must be between 0:00 AM and 3:00 AM, or the app considers it as marking for today
    log.tasks.sleep = {
      status: 'completed',
      completedAt: now,
      proof: { imageUrl: null, gps: { lat: null, lng: null }, exifTimestamp: null },
    };

    const tasksObj = {};
    for (const key of Object.keys(log.tasks.toObject ? log.tasks.toObject() : log.tasks)) {
      tasksObj[key] = log.tasks[key];
    }
    log.score = calculateScore(tasksObj);
    log.isSuccess = isDaySuccess(log.score);
    await log.save();

    res.json({ message: 'Sleep marked as success.', score: log.score });
  } catch (error) {
    console.error('Sleep success error:', error);
    res.status(500).json({ error: 'Failed to mark sleep' });
  }
});

export default router;
