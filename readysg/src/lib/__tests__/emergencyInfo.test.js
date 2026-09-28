jest.mock('../firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn(() => Promise.resolve()) }));
jest.mock('../storage', () => ({
  loadJSON: jest.fn(),
  saveJSON: jest.fn(),
  keys: { emergencyInfo: (uid) => `readysg:emergency:${uid}` },
}));

import { getDoc } from 'firebase/firestore';
import { emptyPerson, emptyInfo, shareText, loadEmergencyInfo, saveEmergencyInfo } from '../emergencyInfo';
import { loadJSON, saveJSON } from '../storage';

// Pretend the phone and the cloud each have a saved card.
const onPhone = (name, updatedAt) => loadJSON.mockResolvedValue({ me: { name }, updatedAt });
const inCloud = (name, updatedAt) => getDoc.mockResolvedValue({ exists: () => true, data: () => ({ me: { name }, updatedAt }) });

test('shareText only lists the filled-in fields', () => {
  const text = shareText({ ...emptyPerson(), name: 'Alex', bloodType: 'A-' });
  expect(text).toBe('Emergency info for Alex\nBlood type: A-\nShared from ReadySG');
});

test('loadEmergencyInfo keeps whichever copy is newer', async () => {
  onPhone('Phone', 500);
  inCloud('Cloud', 100);
  expect((await loadEmergencyInfo('uid')).me.name).toBe('Phone');

  onPhone('Phone', 100);
  inCloud('Cloud', 900);
  expect((await loadEmergencyInfo('uid')).me.name).toBe('Cloud');
});

test('loadEmergencyInfo works offline for a new user', async () => {
  loadJSON.mockResolvedValue(null);
  getDoc.mockRejectedValue(new Error('offline'));
  expect((await loadEmergencyInfo('uid')).me.id).toBe('me');
});

test('saveEmergencyInfo saves to the phone with a timestamp', async () => {
  const saved = await saveEmergencyInfo('uid', emptyInfo());
  expect(saved.updatedAt).toBeGreaterThan(0);
  expect(saveJSON).toHaveBeenCalledWith('readysg:emergency:uid', saved);
});
