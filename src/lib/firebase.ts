import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, setDoc, deleteDoc, getDocs, onSnapshot, collection } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the exact custom database ID provisioned for this applet
export const db = initializeFirestore(
  app,
  {},
  firebaseConfig.firestoreDatabaseId || '(default)'
);

export { doc, getDoc, setDoc, deleteDoc, getDocs, onSnapshot, collection };
