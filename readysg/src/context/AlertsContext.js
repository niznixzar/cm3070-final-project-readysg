// Watches the Firestore `alerts` collection and keeps the unexpired alerts that
// cover the user's location (or the whole island). New ones show a banner.
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { loadJSON, saveJSON, keys } from '../lib/storage';
import { distanceKm, getCurrentLocation } from '../lib/geo';
import { showAlertNotification } from '../lib/notifications';

const AlertsContext = createContext({ alerts: [], location: null });

const toMs = (v) => (v?.toMillis ? v.toMillis() : typeof v === 'number' ? v : null);

export function AlertsProvider({ children }) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);
  const seen = useRef(null);

  useEffect(() => {
    getCurrentLocation({ ask: true }).then(setLocation);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'alerts'), where('expiresAt', '>', Timestamp.now()));

    const unsub = onSnapshot(
      q,
      async (snap) => {
        if (!seen.current) seen.current = new Set((await loadJSON(keys.seenAlerts, [])) ?? []);
        const loc = location ?? (await getCurrentLocation({ ask: false }));

        const relevant = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .map((a) => ({ ...a, createdAtMs: toMs(a.createdAt), expiresAtMs: toMs(a.expiresAt) }))
          .filter((a) => {
            if (!a.radiusKm || a.lat == null || a.lng == null) return true; // islandwide
            if (!loc) return true; // can't tell, so show it rather than hide it
            return distanceKm(loc, { lat: a.lat, lng: a.lng }) <= a.radiusKm;
          })
          .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));

        setAlerts(relevant);

        const fresh = relevant.filter((a) => !seen.current.has(a.id));
        for (const a of fresh) {
          seen.current.add(a.id);
          await showAlertNotification(a);
        }
        if (fresh.length) saveJSON(keys.seenAlerts, [...seen.current].slice(-100));
      },
      () => {}
    );
    return unsub;
  }, [user, location]);

  return <AlertsContext.Provider value={{ alerts, location }}>{children}</AlertsContext.Provider>;
}

export const useAlerts = () => useContext(AlertsContext);
