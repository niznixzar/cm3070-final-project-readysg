import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { emptyProfile } from '../lib/gamification';

const AuthContext = createContext(null);

// Firebase error codes as plain messages that say how to fix the problem.
export function authErrorMessage(e) {
  switch (e?.code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address, like name@example.com.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'That email and password do not match. Check them and try again.';
    case 'auth/email-already-in-use':
      return 'An account already uses this email. Sign in instead.';
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'No internet connection. Connect and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    default:
      return 'Something went wrong. Try again.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitialising(false);
    });
  }, []);

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);

  const register = async (displayName, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const name = displayName.trim().slice(0, 40);
    await updateProfile(cred.user, { displayName: name });
    const profile = emptyProfile(name);
    // Private user doc and public leaderboard entry.
    await setDoc(doc(db, 'users', cred.user.uid), {
      ...profile,
      email: cred.user.email,
      createdAt: Date.now(),
    });
    await setDoc(doc(db, 'publicProfiles', cred.user.uid), {
      displayName: name,
      xp: 0,
      level: 1,
      contributions: 0,
      weekKey: null,
      weeklyXp: 0,
      weeklyContrib: 0,
      monthKey: null,
      monthlyXp: 0,
      monthlyContrib: 0,
    });
    return cred.user;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email.trim());
  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, initialising, signIn, register, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
