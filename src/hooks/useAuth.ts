import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { auth, db } from "@/config/firebase";
import {
  COLLECTIONS,
  type NgoStatus,
  type Role,
  ROLES,
} from "@/constants/roles";

// Represents the user's profile stored in Firestore under users/{uid}.
export type UserProfile = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  accountStatus: string;
};

// Represents everything the app needs to know about the current session.
type AuthState = {
  user: User | null; // Firebase Authentication user; null means signed out
  profile: UserProfile | null; // User's Firestore profile
  role: Role | null; // enterprise, ngo, admin, or null
  ngoStatus: NgoStatus | null; // NGO verification status; null for non-NGOs or while loading
  loading: boolean; // True while authentication or the user profile is loading
};

// Only accept roles defined in our shared roles constants.
const VALID_ROLES: Role[] = [
  ROLES.ENTERPRISE,
  ROLES.NGO,
  ROLES.ADMIN,
];

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ngoStatus, setNgoStatus] = useState<NgoStatus | null>(null);

  // Track authentication loading separately from profile loading.
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // 1. Listen for Firebase Authentication changes.
  // This tells us when a user signs in, signs out, or restores a session.
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        // Clear session-specific data when the user signs out.
        setProfile(null);
        setNgoStatus(null);
        setProfileLoading(false);
      } else {
        // A new or restored session needs its Firestore profile loaded.
        // Clear previous data so it cannot briefly appear for another user.
        setProfile(null);
        setNgoStatus(null);
        setProfileLoading(true);
      }
    });
  }, []);

  // The Firebase UID identifies the user's Firestore documents.
  const uid = user?.uid ?? null;

  // 2. Listen to users/{uid} for the current user's profile.
  // onSnapshot keeps the profile updated when Firestore data changes.
  useEffect(() => {
    if (!uid) {
      // There is no signed-in user to load a profile for.
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    return onSnapshot(
      doc(db, COLLECTIONS.USERS, uid),
      (snapshot) => {
        // A missing document means the account has no Firestore profile.
        const data = snapshot.exists() ? snapshot.data() : null;

        // Validate essential fields before treating the document as a profile.
        if (
          data &&
          data.userId === uid &&
          VALID_ROLES.includes(data.role as Role) &&
          typeof data.name === "string" &&
          typeof data.email === "string" &&
          typeof data.accountStatus === "string"
        ) {
          setProfile(data as UserProfile);
        } else {
          // Reject missing or malformed profile data.
          setProfile(null);
        }

        // The initial profile read has finished.
        setProfileLoading(false);
      },
      (error) => {
        // A permission or network error should not leave the app loading forever.
        console.error("Failed to load user profile:", error);
        setProfile(null);
        setProfileLoading(false);
      }
    );
  }, [uid]);

  // Get the role from the validated profile.
  const role = profile?.role ?? null;

  // 3. Listen to ngos/{uid} only when the signed-in user is an NGO.
  // This lets the app react when an admin approves or rejects an NGO.
  useEffect(() => {
    if (!uid || role !== ROLES.NGO) {
      // Enterprises and admins do not have an NGO verification status here.
      setNgoStatus(null);
      return;
    }

    return onSnapshot(
      doc(db, COLLECTIONS.NGOS, uid),
      (snapshot) => {
        // Read and validate the NGO's verification status.
        const status = snapshot.exists()
          ? snapshot.data().verificationStatus
          : null;

        if (
          status === "pending" ||
          status === "approved" ||
          status === "rejected"
        ) {
          setNgoStatus(status as NgoStatus);
        } else {
          // Missing or unexpected status is treated as unknown.
          setNgoStatus(null);
        }
      },
      (error) => {
        // Keep the status unknown if the NGO document cannot be read.
        console.error("Failed to load NGO verification status:", error);
        setNgoStatus(null);
      }
    );
  }, [uid, role]);

  // 4. Return the current authentication state to the app.
  // Wait for Firebase Auth and the user profile, but not the NGO status listener.
  return {
    user,
    profile: user ? profile : null,
    role: user ? role : null,
    ngoStatus: user ? ngoStatus : null,
    loading: authLoading || profileLoading,
  };
}