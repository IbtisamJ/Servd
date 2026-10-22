import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StatusTimeline } from '@/components/enterprise/status-timeline';
import { Banner } from '@/components/servd/banner';
import { Button } from '@/components/servd/button';
import { Card } from '@/components/servd/card';
import { ConfirmDialog } from '@/components/servd/confirm-dialog';
import { Screen, SectionTitle } from '@/components/servd/screen';
import { StatusBadge } from '@/components/servd/status-badge';
import { EmptyState, LoadingState } from '@/components/servd/states';
import { ServdColors, ServdType } from '@/constants/servd-theme';
import {
  cancelDonation,
  errorMessage,
  takeDonationNotice,
  useDonation,
  type DonationNotice,
} from '@/hooks/use-donations';
import type { Donation } from '@/types/donation';
import { describeBestBefore, formatDate, formatDateTime } from '@/utils/dates';
import {
  buildStatusTimeline,
  canCancelDonation,
  canEditDonation,
  describeDonationStatus,
  DONATION_STATUS_TONE,
  RESERVATION_STATUS_TONE,
} from '@/utils/donation-status';

const NOTICE_COPY: Record<DonationNotice, { title: string; message: string }> = {
  created: { title: 'Donation listed', message: 'NGOs can now see and reserve it.' },
  updated: { title: 'Changes saved', message: 'NGOs will see the updated details.' },
  cancelled: { title: 'Donation cancelled', message: "It's no longer visible to NGOs." },
};

export default function DonationDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { donation, isLoading, notFound } = useDonation(id);

  const [notice, setNotice] = useState<DonationNotice | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const pending = id ? takeDonationNotice(id) : undefined;
      if (pending) setNotice(pending);
    }, [id])
  );

  const handleCancel = async () => {
    if (!donation) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelDonation(donation.id);
      setConfirmOpen(false);
      setNotice('cancelled');
    } catch (error) {
      setCancelError(errorMessage(error));
    } finally {
      setCancelling(false);
    }
  };

  if (!donation) {
    return (
      <Screen navTitle="Donation Details" title="Donation Details">
        {isLoading ? (
          <LoadingState label="Loading donation…" />
        ) : notFound ? (
          <EmptyState
            icon="error"
            title="Donation not found"
            message={`We couldn't find donation ${id ?? ''}. It may have been removed.`}
            action={<Button label="Back to My Donations" onPress={() => router.replace('/enterprise/donations')} />}
          />
        ) : (
          <EmptyState icon="error" title="Couldn't load this donation" message="Pull down on My Donations to retry." />
        )}
      </Screen>
    );
  }

  const tone = DONATION_STATUS_TONE[donation.status];
  const reservedBy = donation.reservation?.ngoName;

  return (
    <Screen navTitle="Donation Details" title="Donation Details">
      {notice ? (
        <Banner
          tone={notice === 'cancelled' ? 'info' : 'success'}
          title={NOTICE_COPY[notice].title}
          message={NOTICE_COPY[notice].message}
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.overline}>Donation status</Text>
          <StatusBadge label={donation.status} tone={tone} size="md" />
        </View>
        <Text style={styles.statusText}>{describeDonationStatus(donation)}</Text>
        <View style={styles.divider} />
        <StatusTimeline steps={buildStatusTimeline(donation)} />
      </Card>

      <Card style={styles.detailsCard}>
        <Text style={styles.foodTitle}>{donation.foodName}</Text>
        <Detail label="Category" value={donation.category} />
        <Detail label="Description" value={donation.description} />
        <Detail label="Quantity" value={String(donation.quantity)} />
        <Detail label="Collection Location" value={donation.collectionLocation} />
        <Detail
          label="Best Before"
          value={formatDate(donation.bestBefore)}
          hint={donation.status === 'Available' || donation.status === 'Reserved' ? describeBestBefore(donation.bestBefore) : null}
        />
        <Detail label="Donation ID" value={donation.id} />
        <Detail label="Listed" value={formatDateTime(donation.createdAt)} />
        {donation.updatedAt !== donation.createdAt ? (
          <Detail label="Last Updated" value={formatDateTime(donation.updatedAt)} />
        ) : null}
      </Card>

      <SectionTitle>Reservation</SectionTitle>
      <ReservationCard donation={donation} />

      <Actions
        donation={donation}
        onEdit={() => router.push({ pathname: '/enterprise/donations/[id]/edit', params: { id: donation.id } })}
        onCancel={() => {
          setCancelError(null);
          setConfirmOpen(true);
        }}
      />

      <ConfirmDialog
        visible={confirmOpen}
        destructive
        title="Cancel this donation?"
        message={
          donation.status === 'Reserved'
            ? `${reservedBy ?? 'An NGO'} has reserved this donation. Cancelling will also cancel their reservation, so only do this if the food is no longer available.`
            : "It will be removed from Available Donations and NGOs won't be able to reserve it. This can't be undone."
        }
        confirmLabel="Cancel Donation"
        cancelLabel="Keep Donation"
        loading={cancelling}
        error={cancelError}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}

function Detail({ label, value, hint }: { label: string; value: string; hint?: string | null }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
      {hint ? <Text style={styles.detailHint}>{hint}</Text> : null}
    </View>
  );
}

function ReservationCard({ donation }: { donation: Donation }) {
  const r = donation.reservation;

  if (!r) {
    return (
      <Card tone="muted">
        <Text style={styles.muted}>
          {donation.status === 'Cancelled'
            ? 'This donation was cancelled before any NGO reserved it.'
            : 'No reservations yet. NGOs can find this donation under Available Donations.'}
        </Text>
      </Card>
    );
  }

  const tone = RESERVATION_STATUS_TONE[r.status];
  return (
    <Card style={styles.detailsCard}>
      <Detail label="NGO" value={r.ngoName} />
      <Detail label="Reservation ID" value={r.id} />
      <Detail label="Reserved" value={formatDateTime(r.reservedAt)} />
      {r.collectedAt ? <Detail label="Collected" value={formatDateTime(r.collectedAt)} /> : null}
      {r.cancelledAt ? <Detail label="Cancelled" value={formatDateTime(r.cancelledAt)} /> : null}
      <Text style={[styles.reservationStatus, { color: tone.color }]}>Status: {r.status}</Text>
      {r.status === 'Cancelled' && donation.status === 'Available' ? (
        <Text style={styles.muted}>The NGO cancelled, so the donation went back to Available Donations.</Text>
      ) : null}
      {r.status === 'Cancelled' && donation.status === 'Cancelled' && r.cancelledAt === donation.cancelledAt ? (
        <Text style={styles.muted}>Cancelled because you cancelled the donation.</Text>
      ) : null}
    </Card>
  );
}

function Actions({ donation, onEdit, onCancel }: { donation: Donation; onEdit: () => void; onCancel: () => void }) {
  const editable = canEditDonation(donation);
  const cancellable = canCancelDonation(donation);

  if (!editable && !cancellable) {
    return (
      <Text style={[styles.muted, styles.center]}>
        {donation.status === 'Collected'
          ? 'Collected donations are complete and can no longer be changed.'
          : 'Cancelled donations can no longer be changed.'}
      </Text>
    );
  }

  return (
    <View style={styles.actions}>
      {!editable && donation.status === 'Reserved' ? (
        <Banner
          tone="info"
          icon="lock"
          title="Editing is locked"
          message={`${donation.reservation?.ngoName ?? 'An NGO'} has reserved this donation, so its details can't change. If the food is no longer available, cancel the donation.`}
        />
      ) : null}
      {editable ? <Button label="Edit Donation" icon="edit" onPress={onEdit} /> : null}
      {cancellable ? <Button label="Cancel Donation" variant="danger" onPress={onCancel} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    gap: 14,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  overline: {
    ...ServdType.eyebrow,
    color: ServdColors.textSecondary,
  },
  statusText: {
    ...ServdType.body,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ServdColors.border,
  },
  detailsCard: {
    gap: 14,
  },
  foodTitle: {
    ...ServdType.cardTitle,
  },
  detail: {
    gap: 2,
  },
  detailLabel: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: ServdColors.text,
  },
  detailValue: {
    ...ServdType.body,
  },
  detailHint: {
    ...ServdType.caption,
    color: ServdColors.olive,
  },
  reservationStatus: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  muted: {
    ...ServdType.bodySecondary,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
});
