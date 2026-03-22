export function getISTDate(date = new Date()) {
  // IST is UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + istOffset);
}

export function getTodayStr() {
  const istNow = getISTDate();
  const h = istNow.getUTCHours();
  const m = istNow.getUTCMinutes();
  
  // If before 3:05 AM IST, treat as previous day
  if (h < 3 || (h === 3 && m < 5)) {
    istNow.setUTCDate(istNow.getUTCDate() - 1);
  }
  return istNow.toISOString().split('T')[0];
}

export function getYesterdayStr() {
  const istNow = getISTDate();
  istNow.setUTCDate(istNow.getUTCDate() - 1);
  return istNow.toISOString().split('T')[0];
}

export function getCurrentHourFloat() {
  const istDate = getISTDate();
  return istDate.getUTCHours() + istDate.getUTCMinutes() / 60;
}

export function isSunday() {
  return getISTDate().getUTCDay() === 0;
}
