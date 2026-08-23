import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { deleteField, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { clearLocalDraft, type VendorOnboardingDraft } from '../utils/onboardingDraft';

export type { VendorOnboardingDraft };

export type UserRole = 'vendor' | 'customer';

export type ShopLayoutStyle = 'gallery' | 'logo' | 'banner';

export interface VendorShopProfile {
  businessType: string;
  shopName: string;
  shopDescription: string;
  city?: string;
  whatsapp?: string;
  contactEmail?: string;
  themeColor?: string;
  layoutStyle?: ShopLayoutStyle;
  logoDataUrl?: string;
  bannerDataUrl?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: string;
  shopProfile?: VendorShopProfile;
  /** Half-finished vendor onboarding, mirrored so it can be resumed on any device. */
  onboardingDraft?: VendorOnboardingDraft;
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
  saveVendorShopProfile: (shopProfile: VendorShopProfile) => Promise<boolean>;
  saveVendorOnboardingDraft: (draft: VendorOnboardingDraft) => Promise<void>;
  clearVendorOnboardingDraft: () => Promise<void>;
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
  saveVendorShopProfile: async () => false,
  saveVendorOnboardingDraft: async () => {},
  clearVendorOnboardingDraft: async () => {},
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

const VALID_ROLES: UserRole[] = ['vendor', 'customer'];

const isValidRole = (role: any): role is UserRole => VALID_ROLES.includes(role);

/**
 * Firestore refuses `undefined` field values — the SDK throws before the write is
 * even attempted. The onboarding wizard and the settings form both use `undefined`
 * to mean "left blank", so their payloads have to be cleaned first or the whole
 * write is lost.
 */
const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as T;

const readCachedProfile = (raw: string | null): UserProfile | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as UserProfile) : null;
  } catch (e) {
    return null;
  }
};

const clearCachedRole = (uid: string) => {
  try {
    localStorage.removeItem(`user_role_${uid}`);
    localStorage.removeItem(`user_profile_${uid}`);
  } catch (e) {
    console.warn('localStorage clear warning:', e);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const saveUserRole = async (
    user: User,
    role: UserRole,
    displayName?: string,
    awaitFirestore = false
  ) => {
    // Belt-and-suspenders: the real boundary is the Firestore rule requiring
    // role in ['vendor', 'customer'] on every write (see firestore.rules) —
    // this just fails fast instead of attempting a write Firestore would reject.
    if (!isValidRole(role)) {
      throw new Error(`Refusing to save unrecognized role: ${role}`);
    }

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName:
        displayName ||
        userProfile?.displayName ||
        user.displayName ||
        user.email?.split('@')[0] ||
        'User',
      role,
      createdAt: userProfile?.createdAt || new Date().toISOString(),
    };

    // Instant local cache so login still works when Firestore is slow
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
        console.warn('Firestore save failed; using local cache:', err);
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

  /** Resolves to true only once Firestore has confirmed the write. */
  const saveVendorShopProfile = async (rawShopProfile: VendorShopProfile): Promise<boolean> => {
    if (!currentUser) return false;

    const shopProfile = stripUndefined(rawShopProfile);

    const updatedProfile: UserProfile = {
      uid: currentUser.uid,
      email: currentUser.email || userProfile?.email || '',
      displayName: userProfile?.displayName,
      role: 'vendor',
      createdAt: userProfile?.createdAt,
      shopProfile,
    };

    // Instant local cache, same pattern as saveUserRole
    try {
      localStorage.setItem(`user_profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn('localStorage save warning:', e);
    }

    setUserProfile(updatedProfile);

    // The wizard is finished — its resume draft has served its purpose and must
    // go, or reopening onboarding later would rehydrate stale half-typed values.
    clearLocalDraft(currentUser.uid);

    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await withTimeout(setDoc(userDocRef, { shopProfile, onboardingDraft: deleteField() }, { merge: true }));
      return true;
    } catch (err) {
      // The shop still exists locally and the next load re-attempts this write
      // (see fetchAndSetUserRole) — but the caller deserves to know it isn't
      // on the server yet rather than being told everything is fine.
      console.warn('Firestore shop profile save failed; using local cache:', err);
      return false;
    }
  };

  /**
   * Mirrors the in-progress onboarding wizard to Firestore. Best-effort by
   * design: the localStorage copy written by the wizard is what guarantees a
   * refresh resumes, this is what lets another device pick it up.
   */
  const saveVendorOnboardingDraft = async (draft: VendorOnboardingDraft) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await withTimeout(setDoc(userDocRef, { onboardingDraft: draft }, { merge: true }));
    } catch (err) {
      console.warn('Firestore onboarding draft save failed; local draft still available:', err);
    }
  };

  const clearVendorOnboardingDraft = async () => {
    if (!currentUser) return;
    clearLocalDraft(currentUser.uid);
    setUserProfile((prev) => (prev ? { ...prev, onboardingDraft: undefined } : prev));
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await withTimeout(setDoc(userDocRef, { onboardingDraft: deleteField() }, { merge: true }));
    } catch (err) {
      console.warn('Firestore onboarding draft clear failed:', err);
    }
  };

  const fetchAndSetUserRole = async (user: User): Promise<UserRole | null> => {
    const cachedRole = localStorage.getItem(`user_role_${user.uid}`);
    const cachedProfile = localStorage.getItem(`user_profile_${user.uid}`);
    const userDocRef = doc(db, 'users', user.uid);

    // 1. Try Firestore first to avoid stale local cache
    try {
      const userDocSnap = await withTimeout(getDoc(userDocRef));
      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserProfile;
        const role = data.role;
        if (isValidRole(role)) {
          let profile: UserProfile = { ...data, uid: user.uid };
          const cached = readCachedProfile(cachedProfile);

          // A shop that exists locally but not in Firestore means the write at the
          // end of onboarding never landed (offline, timed out, rejected). Firestore
          // is authoritative for role, but here it is simply behind — trusting it
          // would drop the vendor back into the wizard they already completed.
          // Keep the local shop and retry the write that didn't make it.
          if (role === 'vendor' && !profile.shopProfile && cached?.shopProfile) {
            console.warn('Shop profile missing from Firestore but present locally — restoring it and retrying the write.');
            profile = { ...profile, shopProfile: cached.shopProfile };
            setDoc(
              userDocRef,
              { shopProfile: cached.shopProfile, onboardingDraft: deleteField() },
              { merge: true }
            ).catch((retryErr) => console.warn('Retry of shop profile write failed:', retryErr));
          }

          // Onboarding is over — a leftover draft must never be able to reopen the wizard.
          if (profile.shopProfile && profile.onboardingDraft) {
            profile = { ...profile, onboardingDraft: undefined };
            clearLocalDraft(user.uid);
          }

          setUserRole(role);
          setUserProfile(profile);
          localStorage.setItem(`user_role_${user.uid}`, role);
          localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(profile));
          return role;
        }

        // Firestore is reachable and has an explicit answer: this account carries a
        // role Vendora doesn't recognize (e.g. a leftover 'admin' account from the
        // pre-Vendora product). Firestore is authoritative here, not a cache miss —
        // reject outright instead of falling back to a possibly-stale local cache,
        // and sign the session out so it doesn't silently pass as logged in.
        console.warn(`Rejecting unrecognized role for ${user.uid}: ${role}`);
        clearCachedRole(user.uid);
        setUserRole(null);
        setUserProfile(null);
        try {
          await signOut(auth);
        } catch (signOutErr) {
          console.warn('Sign-out of rejected session failed:', signOutErr);
        }
        return null;
      }
      // No Firestore doc yet — likely a registration still in flight
      // (saveUserRole's Firestore write hasn't landed). Fall through to the
      // local-cache check below, same as when Firestore is unreachable.
    } catch (err) {
      console.warn('Firestore fetch timed out or offline, using fallback:', err);
    }

    // 2. Fall back to local cache when Firestore is unavailable
    if (isValidRole(cachedRole)) {
      setUserRole(cachedRole);
      if (cachedProfile) {
        try {
          setUserProfile(JSON.parse(cachedProfile));
        } catch (_) {}
      }
      return cachedRole;
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
            if (authStateChangeCountRef.current === authCycle) setLoading(false);
          })
          .catch(() => {
            if (authStateChangeCountRef.current === authCycle) setLoading(false);
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
        saveVendorShopProfile,
        saveVendorOnboardingDraft,
        clearVendorOnboardingDraft,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
