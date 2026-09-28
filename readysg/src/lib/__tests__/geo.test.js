// Fake expo-location, which only works on a real phone.
jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

import * as Location from 'expo-location';
import { distanceKm, formatDistance, getCurrentLocation } from '../geo';

test('distanceKm', () => {
  const origin = { lat: 0, lng: 0 };
  expect(distanceKm(origin, origin)).toBe(0);
  expect(distanceKm(origin, { lat: 1, lng: 0 })).toBeCloseTo(111.19, 1); // one degree of latitude
});

test('formatDistance', () => {
  expect(formatDistance(null)).toBe('');
  expect(formatDistance(0.45)).toBe('450 m');
  expect(formatDistance(2.34)).toBe('2.3 km');
});

describe('getCurrentLocation', () => {
  test('returns the position when allowed', async () => {
    Location.getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getLastKnownPositionAsync.mockResolvedValue({ coords: { latitude: 1.3, longitude: 103.8 } });
    await expect(getCurrentLocation()).resolves.toEqual({ lat: 1.3, lng: 103.8 });
  });

  test('returns null when permission is denied', async () => {
    Location.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    await expect(getCurrentLocation()).resolves.toBeNull();
  });

  test('returns null instead of crashing on an error', async () => {
    Location.getForegroundPermissionsAsync.mockRejectedValue(new Error('location services off'));
    await expect(getCurrentLocation()).resolves.toBeNull();
  });
});
