import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDi8qzMOkabAts1Zp7I7iJO8D6ZQzqIoM8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'society-management-syste-337ac.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'society-management-syste-337ac',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'society-management-syste-337ac.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '444153444783',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:444153444783:web:d044dff7ad469bf995175a',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
