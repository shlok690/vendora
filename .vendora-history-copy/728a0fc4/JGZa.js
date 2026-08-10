import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDi8qzMOkabAts1Zp7I7iJO8D6ZQzqIoM8',
  authDomain: 'society-management-syste-337ac.firebaseapp.com',
  projectId: 'society-management-syste-337ac',
  storageBucket: 'society-management-syste-337ac.firebasestorage.app',
  messagingSenderId: '444153444783',
  appId: '1:444153444783:web:d044dff7ad469bf995175a',
  measurementId: 'G-Y0D12T6B18',
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export default app;
