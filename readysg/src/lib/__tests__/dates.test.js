import { dateKey, monthKey, weekKey, timeOfDayGreeting, formatTime } from '../dates';

// Pretend it's this time (UTC). Singapore is 8 hours ahead.
const setNow = (iso) => jest.spyOn(Date, 'now').mockReturnValue(new Date(iso).getTime());
afterEach(() => jest.restoreAllMocks());

test('dateKey uses the Singapore date', () => {
  setNow('2026-09-23T17:00:00Z'); // 1am on the 24th in Singapore
  expect(dateKey()).toBe('2026-09-24');
  expect(dateKey(-1)).toBe('2026-09-23');
});

test('monthKey rolls over at Singapore midnight', () => {
  setNow('2026-09-30T17:00:00Z'); // 1am on 1 October in Singapore
  expect(monthKey()).toBe('2026-10');
});

test('weekKey gives the ISO week and changes on Monday', () => {
  setNow('2026-09-23T04:00:00Z'); // Wednesday
  expect(weekKey()).toBe('2026-W39');
  expect(weekKey(-1)).toBe('2026-W38');
  setNow('2026-09-28T04:00:00Z'); // the next Monday
  expect(weekKey()).toBe('2026-W40');
});

test('timeOfDayGreeting follows Singapore time', () => {
  setNow('2026-09-23T02:00:00Z'); // 10am
  expect(timeOfDayGreeting()).toBe('Good morning');
  setNow('2026-09-23T06:00:00Z'); // 2pm
  expect(timeOfDayGreeting()).toBe('Good afternoon');
  setNow('2026-09-23T12:00:00Z'); // 8pm
  expect(timeOfDayGreeting()).toBe('Good evening');
});

test('formatTime uses a 12-hour clock', () => {
  const format = (iso) => formatTime(new Date(iso).getTime());
  expect(format('2026-09-23T02:05:00Z')).toBe('10:05 am');
  expect(format('2026-09-23T04:00:00Z')).toBe('12:00 pm'); // noon
  expect(format('2026-09-23T16:00:00Z')).toBe('12:00 am'); // midnight
});
