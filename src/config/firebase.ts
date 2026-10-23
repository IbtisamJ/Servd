import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  // @ts-ignore - Metro bundler resolves this for React Native, but standard web typings flag it
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0OkxLsVim65r4q2O9BVaDtaf8eKMYM20",
  authDomain: "servd-9572f.firebaseapp.com",
  projectId: "servd-9572f",
  storageBucket: "servd-9572f.firebasestorage.app",
  messagingSenderId: "91852787330",
  appId: "1:91852787330:web:c7c59db9f19ac907186e9b",
};

// Initialize the Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence, safely handling fast-refresh reloads
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
export default app;