// In-memory burst protection: max 3 task completions in 5 minutes
const completionTimestamps = [];
const MAX_COMPLETIONS = 3;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function burstProtection(req, res, next) {
  const now = Date.now();

  // Remove timestamps older than 5 minutes
  while (completionTimestamps.length > 0 && (now - completionTimestamps[0]) > WINDOW_MS) {
    completionTimestamps.shift();
  }

  if (completionTimestamps.length >= MAX_COMPLETIONS) {
    return res.status(429).json({
      error: 'Burst protection: Cannot complete more than 3 tasks within 5 minutes. Slow down.',
    });
  }

  // Record this completion
  completionTimestamps.push(now);
  next();
}
