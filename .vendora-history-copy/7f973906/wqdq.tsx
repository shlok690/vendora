import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  flatNo?: string;
  createdAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  getUserRole: (user: User) => Promise<UserRole>;
  saveUserRole: (user: User, role: UserRole, displayName?: string, awaitFirestore?: boolean) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
  getUserRole: async () => 'user',
  saveUserRole: async () => {},
  switchRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Utility: wrap promise with a maximum timeout (e.g. 1.5s) to prevent Firestore network stalls
const withTimeout = <T,>(promise: Promise<T>, timeoutMs = 1500): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs)
    ),
  ]);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const saveUserRole = async (user: User, role: UserRole, displayName?: string, awaitFirestore = false) => {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'User',
      role: role,
      createdAt: userProfile?.createdAt || new Date().toISOString(),
    };

    // Instant local cache save so login can still work when Firestore is slow
    try {
      localStorage.setItem(`user_role_${user.uid}`, role);
      localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(profile));
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }

    setUserRole(role);
    setUserProfile(profile);

    const userDocRef = doc(db, 'users', user.uid);
    const savePromise = setDoc(userDocRef, profile);

    if (awaitFirestore) {
      try {
        await withTimeout(savePromise, 10000);
      } catch (err) {
        console.warn('Firestore save failed or timed out. Continuing with local cache only:', err);
      }
    } else {
      savePromise.catch((err) => {
        console.warn('Background Firestore save failed. Local cache still available:', err);
      });
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!currentUser) return;
    await saveUserRole(currentUser, newRole);
  };

  const fetchAndSetUserRole = async (user: User): Promise<UserRole> => {
    const cachedRole = localStorage.getItem(`user_role_${user.uid}`) as UserRole | null;
    const cachedProfile = localStorage.getItem(`user_profile_${user.uid}`);
    const userDocRef = doc(db, 'users', user.uid);

    // 1. Try fetching from Firestore first to avoid stale local cache causing wrong redirects.
    try {
      const userDocSnap = await withTimeout(getDoc(userDocRef), 1500);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserProfile;
        const role = data.role || 'user';
        setUserRole(role);
        setUserProfile({ ...data, uid: user.uid });
        localStorage.setItem(`user_role_${user.uid}`, role);
        localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify({ ...data, uid: user.uid }));
        return role;
      }
    } catch (err) {
      console.warn('Firestore fetch timed out or offline, using fallback:', err);
    }

    // 2. If Firestore did not provide a document, use cached role as a fallback.
    if (cachedRole) {
      setUserRole(cachedRole);
      if (cachedProfile) {
        try {
          setUserProfile(JSON.parse(cachedProfile));
        } catch (_) {}
      }
      return cachedRole;
    }

    // 3. Final fallback if neither Firestore nor cache gives us a role.
    const isEmailAdmin = (user.email || '').toLowerCase().includes('admin');
    const fallbackRole: UserRole = isEmailAdmin ? 'admin' : 'user';

    const fallbackProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      role: fallbackRole,
      createdAt: new Date().toISOString(),
    };

    setUserRole(fallbackRole);
    setUserProfile(fallbackProfile);
    localStorage.setItem(`user_role_${user.uid}`, fallbackRole);
    localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(fallbackProfile));

    return fallbackRole;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchAndSetUserRole(user).finally(() => setLoading(false));
      } else {
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserRole(null);
    setUserProfile(null);
  };

  const getUserRole = async (user: User): Promise<UserRole> => {
    return await fetchAndSetUserRole(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        userProfile,
        loading,
        logout,
        getUserRole,
        saveUserRole,
        switchRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
