import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // You'll add your Firebase config here later
 apiKey: "AIzaSyA1tW6ANymWRV0wyhMIqstrM6iKbhjdIAg",
  authDomain: "networktroubleshooter-5788d.firebaseapp.com",
  projectId: "networktroubleshooter-5788d",
  storageBucket: "networktroubleshooter-5788d.firebasestorage.app",
  messagingSenderId: "567385278161",
  appId: "1:567385278161:web:104e1248a30ab880fd27f0",
  measurementId: "G-E95Q64ERPZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);