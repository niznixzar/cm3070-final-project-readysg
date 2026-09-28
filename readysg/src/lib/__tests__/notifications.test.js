jest.mock('../storage', () => ({ loadJSON: jest.fn(), saveJSON: jest.fn() }));

import { Vibration } from 'react-native';
import { subscribe, notify, showAlertNotification, runReminders } from '../notifications';
import { loadJSON } from '../storage';
import { dateKey, weekKey } from '../dates';

let received;
let unsubscribe;

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-09-23T04:00:00Z').getTime());
  jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  loadJSON.mockResolvedValue({}); // no reminders shown yet
  received = [];
  unsubscribe = subscribe((n) => received.push(n));
});

afterEach(() => {
  unsubscribe();
  jest.restoreAllMocks();
});

test('notify reaches subscribers until they unsubscribe', () => {
  notify({ title: 'Hi', body: '' });
  unsubscribe();
  notify({ title: 'Again', body: '' });
  expect(received.map((n) => n.title)).toEqual(['Hi']);
});

test('showAlertNotification vibrates and sends an alert', () => {
  showAlertNotification({ id: 'a1', title: 'Flood', body: 'Move to higher ground.' });
  expect(Vibration.vibrate).toHaveBeenCalled();
  expect(received[0]).toMatchObject({ kind: 'alert', alertId: 'a1' });
});

describe('runReminders', () => {
  const profile = (reminders = 'daily', challengeDate = null) => ({
    settings: { reminders },
    dailyChallenge: { date: challengeDate },
  });

  // Runs the reminders and returns the title shown, if any.
  const shown = async (p, lastVisit) => {
    await runReminders({ profile: p, prevDate: lastVisit });
    return received[0]?.title;
  };

  test('shows nothing when reminders are off', async () => {
    expect(await shown(profile('off'), dateKey(-10))).toBeUndefined();
  });

  test('welcomes back someone who was away 3 days', async () => {
    expect(await shown(profile(), dateKey(-3))).toBe('Welcome back');
  });

  test('prompts the daily challenge', async () => {
    expect(await shown(profile(), dateKey(-1))).toBe('Today’s challenge is ready');
  });

  test('shows the weekly reminder once the challenge is done', async () => {
    expect(await shown(profile('daily', dateKey()), dateKey(-1))).toBe('Weekly revision');
  });

  test('stays quiet when everything has been shown', async () => {
    loadJSON.mockResolvedValue({ daily: dateKey(), weekly: weekKey() });
    expect(await shown(profile(), dateKey(-1))).toBeUndefined();
  });
});
