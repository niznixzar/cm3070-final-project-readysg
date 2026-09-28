// The user's progress (XP, missions, streaks, badges) and the actions that change it.
// Shows the phone copy first, then syncs with Firestore, which queues writes offline.
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, AppState } from 'react-native';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { loadJSON, saveJSON, keys } from '../lib/storage';
import { emptyProfile, applyXp, applyDailyOpen, applyBadges, levelInfo, XP } from '../lib/gamification';
import { dateKey } from '../lib/dates';
import { missionById } from '../content/missions';
import { badgeById } from '../content/badges';
import { runReminders } from '../lib/notifications';

const ProgressContext = createContext(null);

// What other users see on the leaderboard.
function publicFields(p) {
  return {
    displayName: p.displayName || 'ReadySG user',
    xp: p.xp ?? 0,
    level: levelInfo(p.xp).level,
    contributions: (p.contributions ?? 0) + (p.verifications ?? 0),
    weekKey: p.periods?.weekKey ?? null,
    weeklyXp: p.periods?.weeklyXp ?? 0,
    weeklyContrib: p.periods?.weeklyContrib ?? 0,
    monthKey: p.periods?.monthKey ?? null,
    monthlyXp: p.periods?.monthlyXp ?? 0,
    monthlyContrib: p.periods?.monthlyContrib ?? 0,
  };
}

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const countedToday = useRef(false); // count the visit once per launch

  // Phone copy first, then the Firestore copy.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      countedToday.current = false;
      return;
    }
    let unsubscribe = () => {};
    let cancelled = false;

    loadJSON(keys.progress(user.uid)).then((cached) => {
      if (cancelled) return;
      if (cached) setProfile(cached);

      unsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          const stored = snap.data() ?? {};
          const data = { ...emptyProfile(), ...stored, displayName: stored.displayName || user.displayName || '' };
          setProfile(data);
          saveJSON(keys.progress(user.uid), data);
          // Repair accounts whose name was wiped by an early save during sign-up.
          if (snap.exists() && !stored.displayName && user.displayName) {
            const displayName = user.displayName;
            Promise.all([
              setDoc(doc(db, 'users', user.uid), { displayName }, { merge: true }),
              setDoc(doc(db, 'publicProfiles', user.uid), { displayName }, { merge: true }),
            ]).catch(() => {});
          }
        },
        // Offline or no permission: keep the phone copy.
        () => setProfile((p) => p ?? emptyProfile(user.displayName ?? ''))
      );
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  // Save to the screen, the phone and Firestore.
  async function commit(next, announce) {
    if (!user) return;
    // The profile can load before sign-up has saved the name, so never save an empty one.
    const named = { ...next, displayName: next.displayName || user.displayName || '' };
    const { profile: withBadges, fresh } = applyBadges(named);
    setProfile(withBadges);
    saveJSON(keys.progress(user.uid), withBadges);

    try {
      await Promise.all([
        setDoc(doc(db, 'users', user.uid), withBadges, { merge: true }),
        setDoc(doc(db, 'publicProfiles', user.uid), publicFields(withBadges), { merge: true }),
      ]);
    } catch (e) {
      console.warn('Progress will sync later', e?.code);
    }

    if (announce) AccessibilityInfo.announceForAccessibility(announce);
    if (fresh.length) {
      const names = fresh.map((id) => badgeById(id)?.name).join(', ');
      Alert.alert('Badge earned', `You earned: ${names}`);
    }
  }

  // Streak and XP for today's visit, then a reminder if one is due.
  function countVisit(p) {
    const lastDate = p.streak?.lastActiveDate;
    const result = applyDailyOpen(p);
    if (result) commit(result.profile);
    runReminders({ profile: result?.profile ?? p, prevDate: lastDate }).catch(() => {});
  }

  // Once per launch, after the first screen draws.
  useEffect(() => {
    if (!profile || countedToday.current) return;
    countedToday.current = true;
    setTimeout(() => countVisit(profile), 1500);
  }, [profile]);

  // Returning from the background may be a new day.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && profile) countVisit(profile);
    });
    return () => sub.remove();
  }, [profile]);

  const toggleStep = (missionId, stepId) => {
    if (!profile || profile.completedMissions?.[missionId]) return;
    const steps = profile.missionProgress?.[missionId] ?? [];
    const updated = steps.includes(stepId) ? steps.filter((s) => s !== stepId) : [...steps, stepId];
    commit({ ...profile, missionProgress: { ...profile.missionProgress, [missionId]: updated } });
  };

  const markComplete = (p, missionId) => ({
    ...p,
    completedMissions: { ...p.completedMissions, [missionId]: { completedAt: Date.now() } },
  });

  const completeMission = (missionId) => {
    const mission = missionById(missionId);
    if (!profile || !mission || profile.completedMissions?.[missionId]) return;
    commit(applyXp(markComplete(profile, missionId), mission.xp), `Mission complete. You earned ${mission.xp} XP.`);
  };

  const answerDailyChallenge = (correct) => {
    if (!profile || profile.dailyChallenge?.date === dateKey()) return;
    const next = { ...profile, dailyChallenge: { date: dateKey(), correct } };
    commit(correct ? applyXp(next, XP.dailyChallenge) : next);
  };

  // kind is 'add' (a new map pin) or 'verify' (confirming someone else's pin)
  const recordContribution = (kind) => {
    if (!profile) return;
    if (kind === 'verify') {
      const next = { ...profile, verifications: (profile.verifications ?? 0) + 1 };
      commit(applyXp(next, XP.verifyResource, { contribution: 1 }));
      return;
    }
    let next = applyXp(profile, XP.addResource, { contribution: 1 });
    if (!next.completedMissions?.['map-resource']) {
      next = applyXp(markComplete(next, 'map-resource'), missionById('map-resource').xp);
    }
    commit(next);
  };

  const setReminders = (frequency) => {
    if (!profile) return;
    const next = { ...profile, settings: { ...profile.settings, reminders: frequency } };
    setProfile(next);
    saveJSON(keys.progress(user.uid), next);
    setDoc(doc(db, 'users', user.uid), { settings: next.settings }, { merge: true }).catch(() => {});
  };

  return (
    <ProgressContext.Provider
      value={{ profile, toggleStep, completeMission, answerDailyChallenge, recordContribution, setReminders }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
