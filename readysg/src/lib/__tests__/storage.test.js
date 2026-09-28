jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn() }));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadJSON, saveJSON, keys } from '../storage';

test('saveJSON stores text and loadJSON reads it back', async () => {
  await saveJSON('k', { xp: 40 });
  expect(AsyncStorage.setItem).toHaveBeenCalledWith('k', '{"xp":40}');

  AsyncStorage.getItem.mockResolvedValue('{"xp":40}');
  await expect(loadJSON('k')).resolves.toEqual({ xp: 40 });
});

test('loadJSON returns the fallback when nothing is saved or the data is broken', async () => {
  AsyncStorage.getItem.mockResolvedValue(null);
  await expect(loadJSON('k', [])).resolves.toEqual([]);

  AsyncStorage.getItem.mockResolvedValue('{not json');
  await expect(loadJSON('k', 'fallback')).resolves.toBe('fallback');
});

test('saveJSON does not crash when storage is full', async () => {
  AsyncStorage.setItem.mockRejectedValue(new Error('full'));
  await expect(saveJSON('k', 1)).resolves.toBeUndefined();
});

test('per-user keys include the user id', () => {
  expect(keys.progress('abc')).toBe('readysg:progress:abc');
});
