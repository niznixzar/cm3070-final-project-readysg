// Emergency info for the user, family and friends. Saved on the phone first so
// it works offline, and backed up to users/{uid}/private/emergencyInfo.
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { loadJSON, saveJSON, keys } from './storage';

export const emptyPerson = () => ({
  id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
  name: '',
  relationship: '',
  bloodType: '',
  allergies: '',
  conditions: '',
  medication: '',
  contactName: '',
  contactPhone: '',
});

export const emptyInfo = () => ({ me: { ...emptyPerson(), id: 'me' }, family: [], friends: [], updatedAt: 0 });

export async function loadEmergencyInfo(uid) {
  const local = (await loadJSON(keys.emergencyInfo(uid))) ?? emptyInfo();
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'private', 'emergencyInfo'));
    if (snap.exists() && (snap.data().updatedAt ?? 0) > (local.updatedAt ?? 0)) {
      await saveJSON(keys.emergencyInfo(uid), snap.data());
      return snap.data();
    }
  } catch {
    // Offline: use the phone copy.
  }
  return local;
}

export async function saveEmergencyInfo(uid, info) {
  const next = { ...info, updatedAt: Date.now() };
  await saveJSON(keys.emergencyInfo(uid), next);
  setDoc(doc(db, 'users', uid, 'private', 'emergencyInfo'), next).catch(() => {});
  return next;
}

// Share text. Only ever the user's own card.
export function shareText(me) {
  const lines = [
    `Emergency info for ${me.name || 'me'}`,
    me.bloodType && `Blood type: ${me.bloodType}`,
    me.allergies && `Allergies: ${me.allergies}`,
    me.conditions && `Medical conditions: ${me.conditions}`,
    me.medication && `Medication: ${me.medication}`,
    (me.contactName || me.contactPhone) &&
      `Emergency contact: ${[me.contactName, me.contactPhone].filter(Boolean).join(', ')}`,
    'Shared from ReadySG',
  ];
  return lines.filter(Boolean).join('\n');
}
