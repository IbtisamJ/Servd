import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/servd/button';
import { Card } from '@/components/servd/card';
import { Icon } from '@/components/servd/icon';
import { StatusBadge } from '@/components/servd/status-badge';
import { ServdColors, ServdType } from '@/constants/servd-theme';
import type { Donation } from '@/types/donation';
import { formatDate, formatDateTime } from '@/utils/dates';
import { DONATION_STATUS_TONE } from '@/utils/donation-status';

type Props = {
  donation: Donation;
  onPress: () => void;
};

/** List card — same shape as the NGO "Available Donations" cards, plus status + reservation info. */
export function DonationCard({ donation, onPress }: Props) {
  const tone = DONATION_STATUS_TONE[donation.status];
  const r = donation.reservation;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {donation.foodName}
        </Text>
        <StatusBadge label={donation.status} tone={tone} />
      </View>

      <View style={styles.lines}>
        <Text style={styles.line}>Donation ID: {donation.id}</Text>
        <Text style={styles.line}>Category: {donation.category}</Text>
        <Text style={styles.line}>Quantity: {donation.quantity}</Text>
        <Text style={styles.line}>Location: {donation.collectionLocation}</Text>
        <Text style={styles.line}>Best before: {formatDate(donation.bestBefore)}</Text>
      </View>

      {r && donation.status === 'Reserved' ? (
        <View style={[styles.reservation, { backgroundColor: ServdColors.tealTint }]}>
          <Icon name="ngo" size={18} color={ServdColors.teal} />
          <View style={styles.reservationText}>
            <Text style={[styles.reservationTitle, { color: ServdColors.teal }]}>
              Reserved by {r.ngoName}
            </Text>
            <Text style={styles.reservationMeta}>
              {formatDateTime(r.reservedAt)} · Awaiting collection
            </Text>
          </View>
        </View>
      ) : null}

      {r && donation.status === 'Collected' ? (
        <Text style={styles.meta}>
          Collected by {r.ngoName}
          {r.collectedAt ? ` · ${formatDateTime(r.collectedAt)}` : ''}
        </Text>
      ) : null}

      {r && donation.status === 'Available' && r.status === 'Cancelled' ? (
        <Text style={styles.meta}>{r.ngoName} cancelled their reservation · available again</Text>
      ) : null}

      <Button
        label="View Details"
        onPress={onPress}
        style={styles.button}
        accessibilityHint={`Opens ${donation.foodName}, ${donation.status.toLowerCase()}`}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    ...ServdType.cardTitle,
    flex: 1,
  },
  lines: {
    gap: 2,
  },
  line: {
    ...ServdType.body,
  },
  reservation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  reservationText: {
    flex: 1,
  },
  reservationTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  reservationMeta: {
    ...ServdType.caption,
  },
  meta: {
    ...ServdType.bodySecondary,
  },
  button: {
    marginTop: 4,
  },
});
