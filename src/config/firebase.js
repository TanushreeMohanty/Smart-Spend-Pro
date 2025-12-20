import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7W9wsGg8pXLwgTJwyQN5WtTzVsBgjoko",
  authDomain: "pro-spendsmart.firebaseapp.com",
  projectId: "pro-spendsmart",
  storageBucket: "pro-spendsmart.firebasestorage.app",
  messagingSenderId: "946184131496",
  appId: "1:946184131496:web:49718a1741aaabc080039d",
  measurementId: "G-CDL8VZQ91F"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = "smartspend-pro-v1";
export const geminiKey = "AIzaSyAlrHMriTgzE2OwKO26XmQ47u5qK6yfJCU"; // 🔴 PASTE GEMINI KEY (Optional)