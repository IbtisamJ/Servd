/**
 * Shared donation types for the Food Enterprise screens.
 *
 * Field names line up with what the NGO screens already display
 * (Food Name, Category, Description, Quantity, Collection Location,
 * Donation ID, Status) so both sides can read the same backend payload.
 */

export const DONATION_CATEGORIES = [
  'Bakery',
  'Produce',
  'Dairy',
  'Prepared Meals',
  'Pantry',
  'Beverages',
  'Other',
] as const;

export type DonationCategory = (typeof DONATION_CATEGORIES)[number];

/**
 * Lifecycle of a donation from the enterprise's point of view.
 * - Available: listed, NGOs can reserve it
 * - Reserved:  an NGO has an active reservation, awaiting collection
 * - Collected: the NGO marked it as collected
 * - Cancelled: the enterprise withdrew it
 */
export type DonationStatus = 'Available' | 'Reserved' | 'Collected' | 'Cancelled';

export const DONATION_STATUSES: DonationStatus[] = ['Available', 'Reserved', 'Collected', 'Cancelled'];

/** Mirrors the statuses on the NGO "My Reservations" screen. */
export type ReservationStatus = 'Active' | 'Collected' | 'Cancelled';

export type Reservation = {
  id: string;
  ngoName: string;
  status: ReservationStatus;
  reservedAt: string; // ISO timestamp
  collectedAt?: string; // ISO timestamp
  cancelledAt?: string; // ISO timestamp
};

export type Donation = {
  id: string; // e.g. DON01
  enterpriseId: string;
  foodName: string;
  category: DonationCategory;
  description: string;
  quantity: number;
  collectionLocation: string;
  bestBefore: string; // YYYY-MM-DD
  status: DonationStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  cancelledAt?: string; // ISO timestamp
  /** Latest reservation on this donation, if any (including a cancelled one). */
  reservation?: Reservation;
};

/** What the enterprise fills in on the create / edit form. */
export type DonationInput = Pick<
  Donation,
  'foodName' | 'category' | 'description' | 'quantity' | 'collectionLocation' | 'bestBefore'
>;
