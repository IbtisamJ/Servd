import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '@/config/firebase';

const NOTIFICATIONS_COLLECTION = 'Notifications';

export type NotificationType =
  | 'reservation'
  | 'cancellation'
  | 'collected'
  | 'donation';

interface CreateNotificationInput {
  recipientId: string;
  title: string;
  message: string;
  type: NotificationType;
  reservationId?: string;
  donationId?: string;
}

export async function createNotification({
  recipientId,
  title,
  message,
  type,
  reservationId,
  donationId,
}: CreateNotificationInput): Promise<void> {
  if (!recipientId?.trim()) {
    throw new Error('A notification recipient is required.');
  }

  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    recipientId,
    title,
    message,
    type,
    reservationId: reservationId ?? null,
    donationId: donationId ?? null,
    read: false,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}