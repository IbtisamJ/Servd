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

// ---------- Our own errors ----------
// Codes starting with "app/" are errors we throw ourselves.
// Their message is already written for the user to read.
function appError(code: string, message: string) {
  return Object.assign(new Error(message), { code });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration(input: RegisterInput) {
  const role: string = input.role;

  if (role !== ROLES.NGO && role !== ROLES.ENTERPRISE) {
    throw appError("app/validation", "Please choose a valid account type.");
  }
  if (!input.name?.trim()) {
    throw appError("app/validation", "Please enter your name.");
  }
  if (!EMAIL_REGEX.test(input.email?.trim() ?? "")) {
    throw appError("app/validation", "That email address isn't valid.");
  }
  if (!input.password || input.password.length < 6) {
    throw appError("app/validation", "Password must be at least 6 characters.");
  }
  if (!input.contactInfo?.trim()) {
    throw appError("app/validation", "Please enter your contact information.");
  }
  if (role === ROLES.NGO) {
    if (!input.organisationName?.trim()) {
      throw appError("app/validation", "Please enter your organisation name.");
    }
    if (!input.npoNumber?.trim()) {
      throw appError("app/validation", "Please enter your NPO number.");
    }
  } else if (!input.enterpriseName?.trim()) {
    throw appError("app/validation", "Please enter your enterprise name.");
  }
}

// ---------- Register ----------
export async function registerUser(input: RegisterInput) {
  // 1. Check the input BEFORE touching Firebase
  validateRegistration(input);

  const email = input.email.trim().toLowerCase();

  // 2. Create the login account in Firebase Authentication
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    input.password
  );
  const uid = credential.user.uid;

  try {
    // 3. Write all the Firestore records together (all succeed or none do)
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
  } catch (error) {
    // ROLLBACK: the Firestore write failed, so don't leave a login account
    // with no profile behind. Deleting the user also signs them out.
    try {
      await credential.user.delete();
    } catch {
      // If even the delete failed, at least sign them out
      await signOut(auth).catch(() => {});
    }
    throw error; // pass the original error on so the screen can show it
  }

  return { uid, role: input.role as Role };
}

// ---------- Profile / login / logout ----------
// Reads the user's record so the app knows which dashboard to show
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? snap.data() : null;
}

export async function loginUser(email: string, password: string) {
  if (!email?.trim() || !password) {
    throw appError("app/validation", "Please enter your email and password.");
  }

  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );
  const profile = await getUserProfile(credential.user.uid);

  if (!profile) {
    await signOut(auth);
    throw appError(
      "app/no-profile",
      "No user record found for this account. Please contact support."
    );
  }
  if (profile.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
    await signOut(auth);
    throw appError("app/suspended", "This account has been suspended.");
  }

  return { uid: credential.user.uid, role: profile.role as Role, profile };
}

export async function logoutUser() {
  await signOut(auth);
}

// Turns error codes into messages a person can read
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;

  // Our own errors already carry a readable message
  if (code?.startsWith("app/")) {
    return (error as Error).message;
  }

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
    case "unavailable":
      return "Network error. Check your connection and try again.";
    case "permission-denied":
      return "You don't have permission to do that.";
    default:
      return "Something went wrong. Please try again.";
  }
}