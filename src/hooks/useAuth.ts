import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { auth, db } from "@/config/firebase";
import { COLLECTIONS, NgoStatus, Role, ROLES } from "@/constants/roles";

export type UserProfile = {
  userId: string;
  name: string;
  email: string;
  role: Role;
  accountStatus: string;
};

type AuthState = {
  user: User | null; // the Firebase login account (null = signed out)
  profile: UserProfile | null; // the Firestore record
  role: Role | null; // "enterprise" | "ngo" | "admin"
  ngoStatus: NgoStatus | null; // only filled in for NGOs
  loading: boolean; // true until we know who (if anyone) is signed in
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ngoStatus, setNgoStatus] = useState<NgoStatus | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  // 1. Listen for sign in / sign out
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setProfileLoading(!!u); // if someone is signed in, we still need their profile
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const uid = user?.uid ?? null;

  // 2. Listen to the signed-in user's record (updates live)
  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }
    return onSnapshot(
      doc(db, COLLECTIONS.USERS, uid),
      (snap) => {
        setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        setProfileLoading(false);
      },
      () => {
        setProfile(null);
        setProfileLoading(false);
      }
    );
  }, [uid]);

  const role = profile?.role ?? null;

  // 3. For NGOs, also listen to their verification status
  useEffect(() => {
    if (!uid || role !== ROLES.NGO) {
      setNgoStatus(null);
      return;
    }
    return onSnapshot(
      doc(db, COLLECTIONS.NGOS, uid),
      (snap) =>
        setNgoStatus(
          snap.exists() ? (snap.data().verificationStatus as NgoStatus) : null
        ),
      () => setNgoStatus(null)
    );
  }, [uid, role]);

  return {
    user,
    profile: user ? profile : null,
    role: user ? role : null,
    ngoStatus: user ? ngoStatus : null,
    loading: authLoading || profileLoading,
  };
}