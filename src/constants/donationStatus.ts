/**
 * Donation status workflow:
 * Available → Reserved → Collected
 * Available → Cancelled
 * Available → Expired
 */

export const DONATION_STATUS = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  COLLECTED: "Collected",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
} as const;