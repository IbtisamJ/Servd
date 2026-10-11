import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";

import { auth, db } from "@/config/firebase";
import {
    ACCOUNT_STATUS,
    COLLECTIONS,
    NGO_STATUS,
    ROLES,
    Role,
} from "@/constants/roles";

// Admins can NEVER self-register. Create them manually in the Firebase console.
export type RegistrableRole = typeof ROLES.ENTERPRISE | typeof ROLES.NGO;

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: RegistrableRole;
  contactInfo: string;
  // NGO only
  organisationName?: string;
  npoNumber?: string;
  // Enterprise only
  enterpriseName?: string;
};

export async function registerUser(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();

  // 1. Create the login account in Firebase Authentication
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    input.password
  );
  const uid = credential.user.uid;

  // 2. Write all the Firestore records together (all succeed or none do)
  const batch = writeBatch(db);

  batch.set(doc(db, COLLECTIONS.USERS, uid), {
    userId: uid,
    name: input.name.trim(),
    email,
    role: input.role,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    createdAt: serverTimestamp(),
  });

  if (input.role === ROLES.NGO) {
    batch.set(doc(db, COLLECTIONS.NGOS, uid), {
      userId: uid,
      organisationName: (input.organisationName ?? "").trim(),
      npoNumber: (input.npoNumber ?? "").trim(),
      contactInfo: input.contactInfo.trim(),
      verificationStatus: NGO_STATUS.PENDING,
      createdAt: serverTimestamp(),
    });
  } else {
    batch.set(doc(db, COLLECTIONS.ENTERPRISES, uid), {
      userId: uid,
      enterpriseName: (input.enterpriseName ?? "").trim(),
      contactInfo: input.contactInfo.trim(),
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return { uid, role: input.role as Role };
}

// Reads the user's record so the app knows which dashboard to show
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? snap.data() : null;
}

export async function loginUser(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
  const profile = await getUserProfile(credential.user.uid);
  if (!profile) {
    throw new Error("No user record found for this account.");
  }
  return { uid: credential.user.uid, role: profile.role as Role, profile };
}

export async function logoutUser() {
  await signOut(auth);
}

// Turns Firebase's technical error codes into messages a person can read
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-email":
      return "That email address isn't valid.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}