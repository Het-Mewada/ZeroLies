import { Router } from 'express';
import DailyLog from '../models/DailyLog.js';
import StudySession from '../models/StudySession.js';
import { getUser } from '../models/User.js';
import { getDayColor } from '../utils/scoring.js';
import { getTodayStr } from '../utils/time.js';

const router = Router();



// Dashboard: calendar data + streak
router.get('/', async (req, res) => {
  try {
    const user = await getUser();
    const today = getTodayStr();

    // Calendar starts from 2026-03-23 for one year
    const CALENDAR_START = '2026-03-23';
    const startDate = new Date(CALENDAR_START + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    endDate.setDate(endDate.getDate() - 1); // 365 days total
    const endStr = endDate.toISOString().split('T')[0];

    const logs = await DailyLog.find({
      date: { $gte: CALENDAR_START, $lte: endStr },
    }).sort({ date: 1 });

    const logMap = {};
    logs.forEach(log => { logMap[log.date] = log; });

    // Build 365-day calendar from start date
    const calendar = [];
    const current = new Date(startDate);
    const todayDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isToday = dateStr === today;
      const isFuture = current > todayDate;
      const log = logMap[dateStr] || null;

      calendar.push({
        date: dateStr,
        color: getDayColor(log, isToday, isFuture),
        score: log?.score || 0,
        isLocked: log?.isLocked || false,
      });

      current.setDate(current.getDate() + 1);
    }

    // Get today's log
    let todayLog = logMap[today] || null;
    if (!todayLog) {
      todayLog = await DailyLog.findOne({ date: today });
    }

    res.json({
      streak: user.streak,
      calendar,
      today: {
        date: today,
        tasks: todayLog?.tasks || null,
        score: todayLog?.score || 0,
        isSuccess: todayLog?.isSuccess || false,
        isLocked: todayLog?.isLocked || false,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Get a specific day's log
router.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const log = await DailyLog.findOne({ date });
    
    // Also fetch all study sessions for this date
    const studySessions = await StudySession.find({ date }).sort({ startTime: 1 });

    if (!log) {
      return res.json({ date, tasks: null, score: 0, isSuccess: false, isLocked: false, studySessions });
    }

    res.json({
      date: log.date,
      tasks: log.tasks,
      score: log.score,
      isSuccess: log.isSuccess,
      isLocked: log.isLocked,
      studySessions,
    });
  } catch (error) {
    console.error('Daily log error:', error);
    res.status(500).json({ error: 'Failed to get daily log' });
  }
});

export default router;
