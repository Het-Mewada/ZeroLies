// Time windows for each task (24h format, IST)
const TIME_WINDOWS = {
  gym: { start: 17, end: 23 },     // 5 PM - 11 PM
  skincare_morning: { start: 6, end: 11 },     // 6 AM - 11 AM
  skincare_night: { start: 21, end: 26 },     // 9 PM - 2 AM (26 = 2 AM next day)
  wake: { start: 0, end: 8 },      // before 8 AM
};

// Tasks that don't have strict time windows
const NO_WINDOW_TASKS = ['gate_study', 'night_walk', 'prayer', 'nofap', 'sleep'];

import { getCurrentHourFloat, isSunday } from '../utils/time.js';

export function validateTimeWindow(req, res, next) {
  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'taskId is required' });
  }

  // NoFap is auto-derived, never submitted manually
  if (taskId === 'nofap') {
    return res.status(400).json({ error: 'NoFap cannot be manually submitted' });
  }

  // Sleep check is special — handled via separate endpoint
  if (taskId === 'sleep') {
    return res.status(400).json({ error: 'Sleep is tracked automatically' });
  }

  // Wake check: Sunday excluded
  if (taskId === 'wake' && isSunday()) {
    return res.status(400).json({ error: 'Wake check-in is excluded on Sundays' });
  }

  // If task has no time window, skip validation
  if (NO_WINDOW_TASKS.includes(taskId)) {
    return next();
  }

  const window = TIME_WINDOWS[taskId];
  if (!window) {
    return next(); // Unknown task, let route handle it
  }

  const currentHour = getCurrentHourFloat();

  // Handle overnight windows (e.g., skincare_night: 21-26 maps to 21-24 + 0-2)
  let inWindow = false;
  if (window.end > 24) {
    // Overnight window
    inWindow = currentHour >= window.start || currentHour < (window.end - 24);
  } else {
    inWindow = currentHour >= window.start && currentHour < window.end;
  }

  if (!inWindow) {
    const startFormatted = `${window.start % 24}:00`;
    const endFormatted = `${window.end % 24}:00`;
    return res.status(400).json({
      error: `${taskId} can only be completed between ${startFormatted} and ${endFormatted}`,
    });
  }

  next();
}

export function validateExifTimestamp(exifTimestamp) {
  if (!exifTimestamp) return false;
  const exifDate = new Date(exifTimestamp);
  const now = new Date();
  const diffMinutes = Math.abs(now - exifDate) / (1000 * 60);
  return diffMinutes <= 5;
}

export function validateGps(gps) {
  return gps && typeof gps.lat === 'number' && typeof gps.lng === 'number';
}
