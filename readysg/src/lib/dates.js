// Dates in Singapore time (UTC+8), so streaks and weekly leaderboards roll over
// at Singapore midnight wherever the phone's clock is set.
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function sgt(ms = Date.now()) {
  return new Date(ms + SGT_OFFSET_MS); // read with getUTC* methods
}

export function dateKey(offsetDays = 0) {
  return sgt(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10); // YYYY-MM-DD
}

export function monthKey() {
  return dateKey().slice(0, 7); // YYYY-MM
}

// ISO-8601 week, e.g. "2026-W39". Weeks start on Monday.
export function weekKey(offsetWeeks = 0) {
  const d = sgt(Date.now() + offsetWeeks * 7 * DAY_MS);
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / DAY_MS + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function timeOfDayGreeting() {
  const h = sgt().getUTCHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatTime(ms) {
  const d = sgt(ms);
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${h < 12 ? 'am' : 'pm'}`;
}
