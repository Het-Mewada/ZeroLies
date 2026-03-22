import cron from 'node-cron';
import DailyLog, { getOrCreateLog } from '../models/DailyLog.js';
import { getUser } from '../models/User.js';
import { calculateScore, isDaySuccess, TASK_POINTS } from '../utils/scoring.js';
import { getYesterdayStr } from '../utils/time.js';

async function lockDay() {
  try {
    const dateStr = getYesterdayStr();
    console.log(`[CRON] Locking day: ${dateStr}`);

    const log = await getOrCreateLog(dateStr);

    if (log.isLocked) {
      console.log(`[CRON] Day ${dateStr} already locked.`);
      return;
    }

    // Mark any pending tasks as failed
    const taskKeys = Object.keys(TASK_POINTS);
    for (const key of taskKeys) {
      if (!log.tasks[key] || log.tasks[key].status === 'pending') {
        log.tasks[key] = {
          status: 'failed',
          completedAt: null,
          proof: { imageUrl: null, gps: { lat: null, lng: null }, exifTimestamp: null },
        };
      }
    }

    // Recalculate final score
    const tasksObj = {};
    for (const key of Object.keys(log.tasks.toObject ? log.tasks.toObject() : log.tasks)) {
      tasksObj[key] = log.tasks[key];
    }
    log.score = calculateScore(tasksObj);
    log.isSuccess = isDaySuccess(log.score);
    log.isLocked = true;
    await log.save();

    // Update streak
    const user = await getUser();
    if (log.isSuccess) {
      user.streak += 1;
      user.lastCompletedDate = dateStr;
    } else {
      user.streak = 0;
    }
    await user.save();

    console.log(`[CRON] Day ${dateStr} locked. Score: ${log.score}, Success: ${log.isSuccess}, Streak: ${user.streak}`);
  } catch (error) {
    console.error('[CRON] Day lock error:', error);
  }
}

export function startDayLockCron() {
  // Run at 3:05 AM every day
  cron.schedule('5 3 * * *', lockDay, {
    timezone: 'Asia/Kolkata',
  });
  console.log('[CRON] Day-lock cron scheduled at 3:05 AM IST');
}

// Export for manual testing
export { lockDay };
