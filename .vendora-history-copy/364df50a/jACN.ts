import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredFirebaseKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = requiredFirebaseKeys.filter(
  (key) => !import.meta.env[key]
);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase config values for: ${missingKeys.join(', ')}. ` +
      'Add them to your .env file as VITE_FIREBASE_* variables.'
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
