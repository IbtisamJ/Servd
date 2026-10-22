import { ServdColors } from '@/constants/servd-theme';
import type { Donation, DonationStatus, ReservationStatus } from '@/types/donation';
import { formatDateTime } from '@/utils/dates';

export type StatusTone = { color: string; tint: string };

export const DONATION_STATUS_TONE: Record<DonationStatus, StatusTone> = {
  Available: { color: ServdColors.olive, tint: ServdColors.oliveTint },
  Reserved: { color: ServdColors.teal, tint: ServdColors.tealTint },
  Collected: { color: ServdColors.slate, tint: ServdColors.slateTint },
  Cancelled: { color: ServdColors.red, tint: ServdColors.redTint },
};

/** Same colours the NGO "My Reservations" screen uses. */
export const RESERVATION_STATUS_TONE: Record<ReservationStatus, StatusTone> = {
  Active: { color: ServdColors.teal, tint: ServdColors.tealTint },
  Collected: { color: ServdColors.olive, tint: ServdColors.oliveTint },
  Cancelled: { color: ServdColors.red, tint: ServdColors.redTint },
};

export const canEditDonation = (d: Donation) => d.status === 'Available';
export const canCancelDonation = (d: Donation) => d.status === 'Available' || d.status === 'Reserved';

/** One-line explanation of where the donation is in its lifecycle. */
export function describeDonationStatus(d: Donation): string {
  switch (d.status) {
    case 'Available':
      return d.reservation?.status === 'Cancelled'
        ? `${d.reservation.ngoName} cancelled their reservation, so this donation is available again.`
        : 'Listed and visible to NGOs. Waiting for a reservation.';
    case 'Reserved':
      return `Reserved by ${d.reservation?.ngoName ?? 'an NGO'}. Awaiting collection from ${d.collectionLocation}.`;
    case 'Collected':
      return `Collected by ${d.reservation?.ngoName ?? 'the NGO'}. Thank you for reducing food waste.`;
    case 'Cancelled':
      return "You cancelled this donation. It's no longer visible to NGOs.";
  }
}

export type TimelineStep = {
  key: string;
  label: string;
  detail?: string;
  state: 'done' | 'current' | 'upcoming' | 'cancelled';
};

/** Listed → Reserved → Collected, or Listed → Cancelled. */
export function buildStatusTimeline(d: Donation): TimelineStep[] {
  const listed: TimelineStep = {
    key: 'listed',
    label: 'Listed',
    detail: formatDateTime(d.createdAt),
    state: 'done',
  };
  const r = d.reservation;

  if (d.status === 'Cancelled') {
    return [
      listed,
      ...(r && r.status === 'Cancelled' && r.cancelledAt === d.cancelledAt
        ? [{ key: 'reserved', label: `Reserved by ${r.ngoName}`, detail: formatDateTime(r.reservedAt), state: 'done' as const }]
        : []),
      {
        key: 'cancelled',
        label: 'Cancelled by you',
        detail: d.cancelledAt ? formatDateTime(d.cancelledAt) : undefined,
        state: 'cancelled',
      },
    ];
  }

  const reserved: TimelineStep =
    d.status === 'Reserved' || d.status === 'Collected'
      ? {
          key: 'reserved',
          label: `Reserved by ${r?.ngoName ?? 'NGO'}`,
          detail: r ? formatDateTime(r.reservedAt) : undefined,
          state: d.status === 'Reserved' ? 'current' : 'done',
        }
      : { key: 'reserved', label: 'Reserved by an NGO', state: 'current' };

  const collected: TimelineStep =
    d.status === 'Collected'
      ? {
          key: 'collected',
          label: 'Collected',
          detail: r?.collectedAt ? formatDateTime(r.collectedAt) : undefined,
          state: 'done',
        }
      : { key: 'collected', label: 'Collected', state: 'upcoming' };

  if (d.status === 'Available') {
    reserved.label = 'Waiting for an NGO to reserve';
  }

  return [listed, reserved, collected];
}
