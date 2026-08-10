import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export type UserRole = 'admin' | 'user' | 'vendor' | 'customer';

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
  getUserRole: (user: User) => Promise<UserRole | null>;
  saveUserRole: (user: User, role: UserRole, displayName?: string, awaitFirestore?: boolean) => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
  getUserRole: async () => null,
  saveUserRole: async () => {},
  switchRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const withTimeout = <T,>(promise: Promise<T>, timeoutMs = 10000): Promise<T> => {
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
        await withTimeout(savePromise);
      } catch (err) {
        console.warn('Firestore save failed after registration; using local cache:', err);
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

  const isValidRole = (role: any): role is UserRole => {
    return role === 'admin' || role === 'user' || role === 'vendor' || role === 'customer';
  };

  const normalizeRole = (role: any): UserRole | null => {
    if (role === 'user') return 'customer';
    if (role === 'admin' || role === 'vendor' || role === 'customer') return role;
    return null;
  };

  const setRoleFromProfile = (uid: string, profile: UserProfile) => {
    const normalizedRole = normalizeRole(profile.role);
    if (!normalizedRole) return;
    const normalizedProfile = { ...profile, role: normalizedRole };
    setUserRole(normalizedRole);
    setUserProfile(normalizedProfile);
    try {
      localStorage.setItem(`user_role_${uid}`, normalizedRole);
      localStorage.setItem(`user_profile_${uid}`, JSON.stringify(normalizedProfile));
    } catch (err) {
      console.warn('localStorage update failed:', err);
    }
  };

  const fetchUserProfileFromFirestore = async (user: User): Promise<UserProfile | null> => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await withTimeout(getDoc(userDocRef), 5000);
    if (!userDocSnap.exists()) {
      return null;
    }
    const data = userDocSnap.data() as UserProfile;
    const normalizedRole = normalizeRole(data.role);
    if (!normalizedRole) {
      throw new Error('Your account has an invalid role.');
    }
    return { ...data, uid: user.uid, role: normalizedRole };
  };

  const fetchAndSetUserRole = async (user: User): Promise<UserRole | null> => {
    const cachedRole = localStorage.getItem(`user_role_${user.uid}`) as UserRole | null;
    const cachedProfile = localStorage.getItem(`user_profile_${user.uid}`);

    const applyCachedRole = () => {
      const normalizedCachedRole = normalizeRole(cachedRole);
      if (!normalizedCachedRole) {
        localStorage.removeItem(`user_role_${user.uid}`);
        localStorage.removeItem(`user_profile_${user.uid}`);
        return null;
      }
      setUserRole(normalizedCachedRole);
      if (cachedProfile) {
        try {
          const parsedProfile: UserProfile = JSON.parse(cachedProfile);
          setUserProfile({ ...parsedProfile, role: normalizedCachedRole });
        } catch (_) {
          setUserProfile(null);
        }
      }
      return normalizedCachedRole;
    };

    const cachedResult = applyCachedRole();
    if (cachedResult) {
      fetchUserProfileFromFirestore(user)
        .then((remoteProfile) => {
          if (remoteProfile && remoteProfile.role !== cachedResult) {
            setRoleFromProfile(user.uid, remoteProfile);
          }
        })
        .catch((err) => {
          console.warn('Background Firestore refresh failed:', err);
        });
      return cachedResult;
    }

    try {
      const remoteProfile = await fetchUserProfileFromFirestore(user);
      if (remoteProfile) {
        setRoleFromProfile(user.uid, remoteProfile);
        return remoteProfile.role;
      }
    } catch (err) {
      console.warn('Firestore fetch timed out or offline, using fallback:', err);
    }

    setUserRole(null);
    setUserProfile(null);
    return null;
  };

  const authStateChangeCountRef = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      authStateChangeCountRef.current += 1;
      const authCycle = authStateChangeCountRef.current;

      setCurrentUser(user);
      if (user) {
        setLoading(true);
        fetchAndSetUserRole(user)
          .then(() => {
            if (authStateChangeCountRef.current === authCycle) {
              setLoading(false);
            }
          })
          .catch(() => {
            if (authStateChangeCountRef.current === authCycle) {
              setLoading(false);
            }
          });
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

  const getUserRole = async (user: User): Promise<UserRole | null> => {
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
