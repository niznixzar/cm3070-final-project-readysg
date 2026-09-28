// In-app notifications (no native module, so it works in Expo Go).
// Call notify() anywhere and NotificationBanner shows it. Reminders are
// checked when the app opens, not scheduled with the phone's OS.
import { Vibration } from 'react-native';
import { loadJSON, saveJSON } from './storage';
import { dateKey, weekKey } from './dates';

const listeners = new Set();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// kind: 'alert' (stays until dismissed) | 'reminder' | 'info'
export function notify({ title, body, kind = 'info', alertId = null, href = null }) {
  const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, body, kind, alertId, href };
  listeners.forEach((l) => l(item));
}

// Called by AlertsContext for each new alert.
export function showAlertNotification(alert) {
  Vibration.vibrate([0, 400, 200, 400]); // a distinct pattern, like SG Alert
  notify({
    kind: 'alert',
    title: `Simulated alert: ${alert.title}`,
    body: alert.body,
    alertId: alert.id,
  });
}

const SHOWN_KEY = 'readysg:remindersShown';
const DAY_MS = 24 * 60 * 60 * 1000;

// Shows at most one reminder per app open, and each kind at most once a day or week.
// prevDate is the last active date before today's visit was counted.
export async function runReminders({ profile, prevDate }) {
  const frequency = profile?.settings?.reminders ?? 'daily';
  if (frequency === 'off') return;

  const shown = (await loadJSON(SHOWN_KEY, {})) ?? {};
  const today = dateKey();
  const week = weekKey();
  let reminder = null;

  // Away for 3 or more days.
  if (prevDate && Date.parse(today) - Date.parse(prevDate) >= 3 * DAY_MS && shown.inactive !== today) {
    reminder = { key: 'inactive', value: today, title: 'Welcome back', body: 'Pick up where you left off. A quick mission keeps you prepared.', href: '/missions' };
  } else if (frequency === 'daily' && profile.dailyChallenge?.date !== today && shown.daily !== today) {
    reminder = { key: 'daily', value: today, title: 'Today\u2019s challenge is ready', body: 'One question, 15 XP, and it keeps your streak going.', href: '/challenge' };
  } else if (shown.weekly !== week) {
    reminder = { key: 'weekly', value: week, title: 'Weekly revision', body: 'Revisit a guide this week so the steps stay fresh.', href: '/guides' };
  }

  if (!reminder) return;
  await saveJSON(SHOWN_KEY, { ...shown, [reminder.key]: reminder.value });
  notify({ kind: 'reminder', title: reminder.title, body: reminder.body, href: reminder.href });
}
