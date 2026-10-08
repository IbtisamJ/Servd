/**
 * NGO verification workflow.
 * NGOs must be approved before
 * reserving donations.
 */

export const NGO_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;
