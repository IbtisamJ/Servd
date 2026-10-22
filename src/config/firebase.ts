import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
 
const firebaseConfig = {
  apiKey: "AIzaSyB0OkxLsVim65r4q2O9BVaDtaf8eKMYM20",
  authDomain: "servd-9572f.firebaseapp.com",
  projectId: "servd-9572f",
  storageBucket: "servd-9572f.firebasestorage.app",
  messagingSenderId: "91852787330",
  appId: "1:91852787330:web:c7c59db9f19ac907186e9b"
};


export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
