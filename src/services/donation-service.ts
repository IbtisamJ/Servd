/**
 * Donation service for the Food Enterprise screens, backed by Cloud Firestore.
 *
 * Firestore layout:
 *   donations/{DON01}   one document per donation (fields match src/types/donation.ts)
 *   counters/donations  { last: number } used to hand out DON01, DON02, ...
 *
 * The function names and return types are the same as the old mock, so the
 * hooks and screens don't need to change.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import type { Donation, DonationInput, Reservation } from '@/types/donation';

/**
 * TODO(auth): replace with the signed-in enterprise's id once login is wired up
 * (with Firebase Auth that's usually auth.currentUser?.uid).
 */
export const CURRENT_ENTERPRISE_ID = 'ENT01';

const donationsRef = collection(db, 'donations');
const counterRef = doc(db, 'counters', 'donations');

export class DonationServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'not_found' | 'conflict' | 'unknown' = 'unknown'
  ) {
    super(message);
    this.name = 'DonationServiceError';
  }
}

const notFound = (id: string) => new DonationServiceError('Donation ' + id + ' was not found.', 'not_found');

/** Firestore Timestamp (or an ISO string written by someone else) -> ISO string. */
function toISO(value: unknown): string | undefined {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}

function toReservation(data: DocumentData | undefined): Reservation | undefined {
  if (!data) return undefined;
  return {
    id: data.id,
    ngoName: data.ngoName,
    status: data.status,
    reservedAt: toISO(data.reservedAt) ?? '',
    collectedAt: toISO(data.collectedAt),
    cancelledAt: toISO(data.cancelledAt),
  };
}

function toDonation(snap: DocumentSnapshot): Donation {
  const d = snap.data();
  if (!d) throw notFound(snap.id);
  // serverTimestamp() reads back as null until the write has reached the server.
  const now = new Date().toISOString();
  return {
    id: snap.id,
    enterpriseId: d.enterpriseId,
    foodName: d.foodName,
    category: d.category,
    description: d.description,
    quantity: d.quantity,
    collectionLocation: d.collectionLocation,
    bestBefore: d.bestBefore,
    status: d.status,
    createdAt: toISO(d.createdAt) ?? now,
    updatedAt: toISO(d.updatedAt) ?? now,
    cancelledAt: toISO(d.cancelledAt),
    reservation: toReservation(d.reservation),
  };
}

export async function listEnterpriseDonations(enterpriseId = CURRENT_ENTERPRISE_ID): Promise<Donation[]> {
  const snap = await getDocs(query(donationsRef, where('enterpriseId', '==', enterpriseId)));
  // Sorted here instead of with orderBy() so Firestore doesn't need a composite index.
  return snap.docs.map((d) => toDonation(d)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDonation(id: string): Promise<Donation> {
  const snap = await getDoc(doc(donationsRef, id));
  if (!snap.exists()) throw notFound(id);
  return toDonation(snap);
}

export async function createDonation(input: DonationInput): Promise<Donation> {
  // A transaction so two enterprises listing at the same time can't get the same DON number.
  const id = await runTransaction(db, async (tx) => {
    const counter = await tx.get(counterRef);
    const next = (counter.exists() ? Number(counter.data().last) || 0 : 0) + 1;
    const newId = 'DON' + String(next).padStart(2, '0');

    tx.set(counterRef, { last: next });
    tx.set(doc(donationsRef, newId), {
      ...input,
      enterpriseId: CURRENT_ENTERPRISE_ID,
      status: 'Available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newId;
  });
  return getDonation(id);
}

export async function updateDonation(id: string, input: DonationInput): Promise<Donation> {
  const ref = doc(donationsRef, id);
  // Read + write in one transaction so an NGO can't reserve it halfway through the edit.
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw notFound(id);
    const status = String(snap.data().status);
    if (status !== 'Available') {
      throw new DonationServiceError(
        'This donation is ' + status.toLowerCase() + ' and can no longer be edited.',
        'conflict'
      );
    }
    tx.update(ref, { ...input, updatedAt: serverTimestamp() });
  });
  return getDonation(id);
}

export async function cancelDonation(id: string): Promise<Donation> {
  const ref = doc(donationsRef, id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw notFound(id);
    const data = snap.data();
    if (data.status === 'Collected' || data.status === 'Cancelled') {
      throw new DonationServiceError(
        'This donation is already ' + String(data.status).toLowerCase() + ' and can no longer be cancelled.',
        'conflict'
      );
    }
    const changes: Record<string, unknown> = {
      status: 'Cancelled',
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    // Cancelling a reserved donation also cancels the NGO's reservation.
    if (data.reservation?.status === 'Active') {
      changes['reservation.status'] = 'Cancelled';
      changes['reservation.cancelledAt'] = serverTimestamp();
    }
    tx.update(ref, changes);
  });
  return getDonation(id);
}