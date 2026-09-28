// AsyncStorage wrapper for JSON values. Never throws.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadJSON(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable: carry on from memory.
  }
}

export const keys = {
  progress: (uid) => `readysg:progress:${uid}`,
  emergencyInfo: (uid) => `readysg:emergency:${uid}`,
  resources: 'readysg:resources',
  seenAlerts: 'readysg:seenAlerts',
  airQuality: 'readysg:airQuality',
  reminderIds: 'readysg:reminderIds',
  themeMode: 'readysg:themeMode',
  fontSize: 'readysg:fontSize',
};
