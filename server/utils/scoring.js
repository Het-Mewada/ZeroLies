export const TASK_POINTS = {
  nofap: 5,
  gate_study: 5,
  gym: 3,
  night_walk: 2,
  prayer: 2,
  skincare_morning: 1,
  skincare_night: 1,
  sleep: 3,
  wake: 3,
};

export const TOTAL_POSSIBLE = 25;
export const SUCCESS_THRESHOLD = 17.5;

export function calculateScore(tasks) {
  let score = 0;
  for (const [taskId, entry] of Object.entries(tasks)) {
    if (entry && entry.status === 'completed') {
      score += TASK_POINTS[taskId] || 0;
    }
  }
  return score;
}

export function isDaySuccess(score) {
  return score >= SUCCESS_THRESHOLD;
}

/**
 * Determine day color:
 * - GREEN: score >= 17.5
 * - RED: past day with score < 17.5, OR current day where 17.5 is impossible
 * - GRAY: today (still possible) or future
 */
export function getDayColor(log, isToday, isFuture) {
  if (isFuture) return 'gray';
  if (!log) return isToday ? 'gray' : 'red';

  const score = log.score || 0;

  if (score >= SUCCESS_THRESHOLD) return 'green';
  if (log.isLocked) return 'red';

  if (isToday) {
    // Calculate max possible remaining
    const tasks = log.tasks || {};
    let remainingPossible = 0;
    for (const [taskId, points] of Object.entries(TASK_POINTS)) {
      const entry = tasks[taskId];
      if (!entry || entry.status === 'pending') {
        remainingPossible += points;
      }
    }
    return (score + remainingPossible) >= SUCCESS_THRESHOLD ? 'gray' : 'red';
  }

  return 'red';
}

export function getMaxPossibleScore(tasks) {
  let current = 0;
  let remaining = 0;
  for (const [taskId, points] of Object.entries(TASK_POINTS)) {
    const entry = tasks?.[taskId];
    if (entry?.status === 'completed') {
      current += points;
    } else if (!entry || entry.status === 'pending') {
      remaining += points;
    }
  }
  return { current, remaining, maxPossible: current + remaining };
}
