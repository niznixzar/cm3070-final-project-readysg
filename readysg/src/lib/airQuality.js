// Live haze readings from data.gov.sg (no API key). Uses the last saved reading offline.
import { loadJSON, saveJSON, keys } from './storage';
import { distanceKm } from './geo';

const PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const PM25_URL = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';

export function psiBand(psi) {
  if (psi == null) return null;
  if (psi <= 50) return { label: 'Good', advice: 'Normal activities for everyone.' };
  if (psi <= 100) return { label: 'Moderate', advice: 'Normal activities for everyone.' };
  if (psi <= 200)
    return {
      label: 'Unhealthy',
      advice: 'Reduce prolonged or strenuous outdoor exertion. Vulnerable groups should minimise it.',
    };
  if (psi <= 300)
    return {
      label: 'Very unhealthy',
      advice: 'Avoid prolonged or strenuous outdoor exertion. Vulnerable groups should minimise outdoor activity.',
    };
  return {
    label: 'Hazardous',
    advice: 'Minimise outdoor activity. Vulnerable groups should avoid outdoor activity.',
  };
}

export function pm25Band(v) {
  if (v == null) return null;
  if (v <= 55) return { band: 1, label: 'Normal' };
  if (v <= 150) return { band: 2, label: 'Elevated' };
  if (v <= 250) return { band: 3, label: 'High' };
  return { band: 4, label: 'Very high' };
}

// Handles both the v2 and older v1 response shapes.
function parse(json, field) {
  const root = json?.data ?? json;
  const regions = root?.regionMetadata ?? root?.region_metadata ?? [];
  const item = root?.items?.[0];
  const readings = item?.readings?.[field];
  return { regions, readings, updated: item?.updatedTimestamp ?? item?.update_timestamp ?? item?.timestamp };
}

function nearestRegion(regions, loc) {
  if (!loc || !regions.length) return 'national';
  let best = null;
  regions.forEach((r) => {
    const ll = r.labelLocation ?? r.label_location;
    if (!ll || r.name === 'national') return;
    const d = distanceKm(loc, { lat: ll.latitude, lng: ll.longitude });
    if (!best || d < best.d) best = { name: r.name, d };
  });
  return best?.name ?? 'national';
}

export async function fetchAirQuality(location) {
  try {
    const [psiRes, pmRes] = await Promise.all([fetch(PSI_URL), fetch(PM25_URL)]);
    const psi = parse(await psiRes.json(), 'psi_twenty_four_hourly');
    const pm = parse(await pmRes.json(), 'pm25_one_hourly');
    const region = nearestRegion(psi.regions, location);
    const psiValue = psi.readings?.[region] ?? psi.readings?.national ?? null;
    const pmValue = pm.readings?.[region] ?? pm.readings?.national ?? null;
    const result = {
      region,
      psi: psiValue,
      pm25: pmValue,
      updated: psi.updated ?? new Date().toISOString(),
      fetchedAt: Date.now(),
      stale: false,
    };
    if (psiValue != null) await saveJSON(keys.airQuality, result);
    return result;
  } catch {
    const cached = await loadJSON(keys.airQuality);
    return cached ? { ...cached, stale: true } : null;
  }
}
