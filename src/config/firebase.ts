import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0OkxLsVim65r4q2O9BVaDtaf8eKMYM20",
  authDomain: "servd-9572f.firebaseapp.com",
  projectId: "servd-9572f",
  storageBucket: "servd-9572f.firebasestorage.app",
  messagingSenderId: "91852787330",
  appId: "1:91852787330:web:c7c59db9f19ac907186e9b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
