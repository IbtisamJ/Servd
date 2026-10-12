import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0OkxLsVim65r4q2O9BVaDtaf8eKMYM20",
  authDomain: "servd-9572f.firebaseapp.com",
  projectId: "servd-9572f",
  storageBucket: "servd-9572f.firebasestorage.app",
  messagingSenderId: "91852787330",
  appId: "1:91852787330:web:c7c59db9f19ac907186e9b",
};

const app = FirebaseAuth ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : getApp();

let authInstance: any;
try {
  const getPersistence = (FirebaseAuth as any).getReactNativePersistence;
  const persistence = typeof getPersistence === "function" ? getPersistence(AsyncStorage) : undefined;
  authInstance = (FirebaseAuth as any).initializeAuth(app, { persistence });
} catch {
  authInstance = FirebaseAuth.getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);

export default app;