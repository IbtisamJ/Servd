/**
 * Donation Status Constants
 *
 * Defines the valid lifecycle states for
 * donations within the Servd application.
 *
 * Main lifecycle:
 * Available -> Reserved -> Collected
 *
 * A donation may also become Cancelled
 * or Expired.
 */

export const DONATION_STATUS = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
} as const;

/**
 * Creates a TypeScript type containing
 * only valid Servd donation statuses.
 */
export type DonationStatus =
  typeof DONATION_STATUS[
    keyof typeof DONATION_STATUS
  ];