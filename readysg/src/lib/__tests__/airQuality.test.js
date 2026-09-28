jest.mock('expo-location', () => ({}));
jest.mock('../storage', () => ({
  loadJSON: jest.fn(),
  saveJSON: jest.fn(),
  keys: { airQuality: 'readysg:airQuality' },
}));

import { psiBand, pm25Band, fetchAirQuality } from '../airQuality';
import { loadJSON } from '../storage';

test('psiBand uses the NEA bands', () => {
  expect(psiBand(null)).toBeNull();
  expect(psiBand(50).label).toBe('Good');
  expect(psiBand(51).label).toBe('Moderate');
  expect(psiBand(150).label).toBe('Unhealthy');
  expect(psiBand(250).label).toBe('Very unhealthy');
  expect(psiBand(301).label).toBe('Hazardous');
});

test('pm25Band', () => {
  expect(pm25Band(null)).toBeNull();
  expect(pm25Band(55).band).toBe(1);
  expect(pm25Band(56).band).toBe(2);
  expect(pm25Band(251).band).toBe(4);
});

describe('fetchAirQuality', () => {
  // Fake data.gov.sg: one response for PSI, one for PM2.5.
  const psi = {
    data: {
      regionMetadata: [
        { name: 'west', labelLocation: { latitude: 1.35, longitude: 103.7 } },
        { name: 'east', labelLocation: { latitude: 1.35, longitude: 103.94 } },
      ],
      items: [{ readings: { psi_twenty_four_hourly: { national: 60, west: 75, east: 40 } } }],
    },
  };
  const pm25 = { data: { items: [{ readings: { pm25_one_hourly: { national: 20, west: 30, east: 12 } } }] } };
  const respond = (body) => Promise.resolve({ json: () => Promise.resolve(body) });

  beforeEach(() => {
    global.fetch = jest.fn((url) => respond(url.includes('pm25') ? pm25 : psi));
  });

  test('uses the region nearest the user', async () => {
    const result = await fetchAirQuality({ lat: 1.35, lng: 103.69 }); // in the west
    expect(result).toMatchObject({ region: 'west', psi: 75, pm25: 30 });
  });

  test('uses the national reading without a location', async () => {
    expect(await fetchAirQuality(null)).toMatchObject({ region: 'national', psi: 60 });
  });

  test('uses the saved reading when offline', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline')));
    loadJSON.mockResolvedValue({ psi: 88 });
    expect(await fetchAirQuality(null)).toEqual({ psi: 88, stale: true });
  });
});
