import * as Location from 'expo-location';

// Used when the user's location is unavailable.
export const SG_CENTER = { lat: 1.3521, lng: 103.8198 };

export function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km) {
  if (km == null) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// { lat, lng } or null. Asks for permission the first time.
export async function getCurrentLocation({ ask = true } = {}) {
  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted' && ask) {
      ({ status } = await Location.requestForegroundPermissionsAsync());
    }
    if (status !== 'granted') return null;
    const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
    const pos =
      last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}
