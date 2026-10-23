/**
 * Application Roles, Statuses, and Collection Names
 *
 * Defines shared constants and TypeScript types used to represent
 * user roles, account statuses, NGO verification statuses, donation
 * statuses, and reservation statuses.
 *
 * Responsibilities:
 * - Defines enterprise, NGO, and admin roles.
 * - Defines active and suspended account statuses.
 * - Defines pending, approved, and rejected NGO statuses.
 * - Defines the supported donation lifecycle statuses.
 * - Defines the supported reservation lifecycle statuses.
 * - Centralises Firestore collection names used across the application.
 *
 * Shared Values:
 * - ROLES
 * - ACCOUNT_STATUS
 * - NGO_STATUS
 * - DONATION_STATUS
 * - RESERVATION_STATUS
 * - COLLECTIONS
 *
 * Purpose:
 * - Reduces inconsistent spelling of roles, statuses, and collection names.
 * - Helps keep Firestore operations and UI logic consistent.
 */

// Shared values used by BOTH the frontend and backend.
// Always import from here. Never type these strings by hand.

export const ROLES = {
  ENTERPRISE: "enterprise",
  NGO: "ngo",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ACCOUNT_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const NGO_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type NgoStatus = (typeof NGO_STATUS)[keyof typeof NGO_STATUS];

export const DONATION_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  COLLECTED: "collected",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export const RESERVATION_STATUS = {
  ACTIVE: "active",
  COLLECTED: "collected",
  CANCELLED: "cancelled",
} as const;

export const COLLECTIONS = {
  USERS: "users",
  NGOS: "ngos",
  ENTERPRISES: "foodEnterprises",
  DONATIONS: "Donations",
  RESERVATIONS: "Reservations",
} as const;
