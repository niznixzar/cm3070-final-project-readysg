import { XP, levelInfo, preparednessPct, emptyProfile, applyXp, applyDailyOpen, applyBadges, dailyIndex } from '../gamification';
import { dateKey, weekKey } from '../dates';
import { MISSIONS } from '../../content/missions';

// Every test runs on Wednesday 23 September 2026.
beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-23T04:00:00Z').getTime()));
afterEach(() => jest.restoreAllMocks());

// A new profile with some streak fields changed.
const withStreak = (streak) => ({ ...emptyProfile(), streak: { ...emptyProfile().streak, ...streak } });

test('levelInfo', () => {
  expect(levelInfo(0)).toMatchObject({ level: 1, name: 'Newcomer', toNext: 100 });
  expect(levelInfo(100).level).toBe(2);
  expect(levelInfo(150)).toMatchObject({ level: 2, pct: 25 });
  expect(levelInfo(5000)).toMatchObject({ nextLevel: null, pct: 100 });
});

test('preparednessPct goes from 0 to 100', () => {
  expect(preparednessPct(emptyProfile())).toBe(0);
  const allDone = Object.fromEntries(MISSIONS.map((m) => [m.id, { completedAt: 1 }]));
  expect(preparednessPct({ completedMissions: allDone })).toBe(100);
});

test('applyXp adds to the total and the weekly total', () => {
  const profile = applyXp(applyXp(emptyProfile(), 10), 5);
  expect(profile.xp).toBe(15);
  expect(profile.periods.weeklyXp).toBe(15);
});

test('applyXp resets the weekly total in a new week', () => {
  const lastWeek = { ...emptyProfile(), periods: { weekKey: '2020-W01', weeklyXp: 100 } };
  expect(applyXp(lastWeek, 5).periods.weeklyXp).toBe(5);
});

describe('applyDailyOpen', () => {
  test('only counts once a day', () => {
    expect(applyDailyOpen(withStreak({ lastActiveDate: dateKey() }))).toBeNull();
  });

  test('starts a streak and gives XP', () => {
    const { profile, xpGained } = applyDailyOpen(emptyProfile());
    expect(profile.streak.current).toBe(1);
    expect(xpGained).toBe(XP.dailyOpen);
  });

  test('continues a streak from yesterday', () => {
    const { profile } = applyDailyOpen(withStreak({ current: 3, lastActiveDate: dateKey(-1) }));
    expect(profile.streak.current).toBe(4);
  });

  test('gives a bonus on day 7', () => {
    const { xpGained } = applyDailyOpen(withStreak({ current: 6, lastActiveDate: dateKey(-1) }));
    expect(xpGained).toBe(XP.dailyOpen + XP.streakMilestone);
  });

  test('resets after a missed day but keeps the longest', () => {
    const { profile } = applyDailyOpen(withStreak({ current: 9, longest: 9, lastActiveDate: dateKey(-3) }));
    expect(profile.streak).toMatchObject({ current: 1, longest: 9 });
  });

  test('counts weeks in a row', () => {
    const lastWeek = withStreak({ weeklyCurrent: 2, lastActiveWeek: weekKey(-1), lastActiveDate: dateKey(-1) });
    expect(applyDailyOpen(lastWeek).profile.streak.weeklyCurrent).toBe(3);
  });
});

test('applyBadges awards each badge once', () => {
  const profile = { ...emptyProfile(), completedMissions: { 'cpr-basics': { completedAt: 1 } } };
  const first = applyBadges(profile);
  expect(first.fresh).toEqual(expect.arrayContaining(['first-mission', 'first-aid-learner']));
  expect(applyBadges(first.profile).fresh).toEqual([]);
});

test('dailyIndex is the same all day and within range', () => {
  expect(dailyIndex(10)).toBe(dailyIndex(10));
  expect(dailyIndex(10)).toBeLessThan(10);
});
