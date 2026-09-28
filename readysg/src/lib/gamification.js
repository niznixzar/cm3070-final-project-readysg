// XP, levels, streaks and badges. Plain functions with no Firebase or React,
// so they're easy to test.
import { dateKey, weekKey, monthKey } from './dates';
import { BADGES } from '../content/badges';
import { MISSIONS, TOTAL_MISSION_XP } from '../content/missions';

export const XP = {
  dailyOpen: 5,
  streakMilestone: 20, // every 7 consecutive days
  dailyChallenge: 15,
  addResource: 30,
  verifyResource: 5,
};

export const LEVELS = [
  { min: 0, name: 'Newcomer' },
  { min: 100, name: 'Aware' },
  { min: 300, name: 'Getting Ready' },
  { min: 600, name: 'Prepared Resident' },
  { min: 1000, name: 'Ready Resident' },
  { min: 1500, name: 'Community Helper' },
  { min: 2200, name: 'Preparedness Champion' },
];

export function levelInfo(xp = 0) {
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (xp >= l.min) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  const pct = next ? Math.round(((xp - current.min) / (next.min - current.min)) * 100) : 100;
  return {
    level: index + 1,
    name: current.name,
    toNext: next ? next.min - xp : 0,
    nextLevel: next ? index + 2 : null,
    pct,
  };
}

// Share of all mission XP the user has earned, 0 to 100.
export function preparednessPct(profile) {
  const earned = MISSIONS.filter((m) => profile.completedMissions?.[m.id]).reduce(
    (s, m) => s + m.xp,
    0
  );
  return Math.round((earned / TOTAL_MISSION_XP) * 100);
}

export const emptyProfile = (displayName = '') => ({
  displayName,
  xp: 0,
  completedMissions: {}, // { missionId: { completedAt: ms } }
  missionProgress: {}, // { missionId: [stepId, ...] }
  contributions: 0,
  verifications: 0,
  badges: [],
  streak: {
    current: 0,
    longest: 0,
    lastActiveDate: null,
    weeklyCurrent: 0,
    weeklyLongest: 0,
    lastActiveWeek: null,
  },
  dailyChallenge: { date: null, correct: null },
  settings: { reminders: 'daily' },
  periods: { weekKey: null, weeklyXp: 0, weeklyContrib: 0, monthKey: null, monthlyXp: 0, monthlyContrib: 0 },
});

// Adds XP, resetting the weekly and monthly totals when a new week or month starts.
export function applyXp(profile, amount, { contribution = 0 } = {}) {
  const wk = weekKey();
  const mk = monthKey();
  const p = profile.periods ?? {};
  const sameWeek = p.weekKey === wk;
  const sameMonth = p.monthKey === mk;
  return {
    ...profile,
    xp: (profile.xp ?? 0) + amount,
    contributions: (profile.contributions ?? 0) + contribution,
    periods: {
      weekKey: wk,
      weeklyXp: (sameWeek ? p.weeklyXp ?? 0 : 0) + amount,
      weeklyContrib: (sameWeek ? p.weeklyContrib ?? 0 : 0) + contribution,
      monthKey: mk,
      monthlyXp: (sameMonth ? p.monthlyXp ?? 0 : 0) + amount,
      monthlyContrib: (sameMonth ? p.monthlyContrib ?? 0 : 0) + contribution,
    },
  };
}

// Once per day: update the streak and add XP. Returns null if today already counted.
export function applyDailyOpen(profile) {
  const today = dateKey();
  const s = profile.streak ?? emptyProfile().streak;
  if (s.lastActiveDate === today) return null;

  const current = s.lastActiveDate === dateKey(-1) ? s.current + 1 : 1;
  const wk = weekKey();
  let weeklyCurrent = s.weeklyCurrent ?? 0;
  if (s.lastActiveWeek !== wk) {
    weeklyCurrent = s.lastActiveWeek === weekKey(-1) ? weeklyCurrent + 1 : 1;
  }

  const streak = {
    current,
    longest: Math.max(s.longest ?? 0, current),
    lastActiveDate: today,
    weeklyCurrent,
    weeklyLongest: Math.max(s.weeklyLongest ?? 0, weeklyCurrent),
    lastActiveWeek: wk,
  };

  const xpGained = XP.dailyOpen + (current % 7 === 0 ? XP.streakMilestone : 0);
  return { profile: applyXp({ ...profile, streak }, xpGained), xpGained };
}

// Adds newly earned badges. `fresh` lists just the new ones.
export function applyBadges(profile) {
  const have = new Set(profile.badges ?? []);
  const fresh = BADGES.filter((b) => !have.has(b.id) && b.earned(profile)).map((b) => b.id);
  if (!fresh.length) return { profile, fresh };
  return { profile: { ...profile, badges: [...have, ...fresh] }, fresh };
}

// Same question for everyone on a given day.
export function dailyIndex(poolSize) {
  const key = dateKey();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % poolSize;
}
