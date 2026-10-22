import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ServiceCard } from '@/components/enterprise/service-card';
import { Banner } from '@/components/servd/banner';
import { Button } from '@/components/servd/button';
import { Card } from '@/components/servd/card';
import { Icon } from '@/components/servd/icon';
import { Screen, SectionTitle } from '@/components/servd/screen';
import { ServdColors, ServdType } from '@/constants/servd-theme';
import { useEnterpriseDonations } from '@/hooks/use-donations';
import type { DonationStatus } from '@/types/donation';
import { formatDateTime } from '@/utils/dates';
import { DONATION_STATUS_TONE } from '@/utils/donation-status';

const OVERVIEW: DonationStatus[] = ['Available', 'Reserved', 'Collected'];

export default function EnterpriseDashboardScreen() {
  const { donations, isLoading, hasError, error, refresh } = useEnterpriseDonations();
  const [refreshing, setRefreshing] = useState(false);

  const count = (status: DonationStatus) => donations.filter((d) => d.status === status).length;
  const awaiting = donations.filter((d) => d.status === 'Reserved');

  const openList = (status?: DonationStatus) =>
    router.push(status ? { pathname: '/enterprise/donations', params: { status } } : '/enterprise/donations');

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <Screen
      navTitle="Dashboard"
      title="Enterprise Dashboard"
      subtitle="Share surplus food and track every donation from listing to collection."
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ServdColors.teal} />}>
      {hasError ? (
        <View style={styles.errorBox}>
          <Banner tone="error" title="Couldn't load your donations" message={error ?? undefined} />
          <Button label="Try again" variant="secondary" onPress={refresh} />
        </View>
      ) : null}

      <Card tone="muted" style={styles.overview}>
        <Text style={styles.overviewLabel}>Donation Overview</Text>
        <View style={styles.stats}>
          {OVERVIEW.map((status) => {
            const tone = DONATION_STATUS_TONE[status];
            return (
              <Pressable
                key={status}
                onPress={() => openList(status)}
                accessibilityRole="button"
                accessibilityLabel={`${isLoading ? 'Loading' : count(status)} ${status}. View donations`}
                style={({ pressed }) => [styles.stat, pressed && styles.statPressed]}>
                <Text style={[styles.statValue, { color: tone.color }]}>{isLoading ? '–' : count(status)}</Text>
                <Text style={styles.statLabel}>{status}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {awaiting.length > 0 ? (
        <>
          <SectionTitle>Awaiting Collection</SectionTitle>
          <Card style={styles.awaitingCard}>
            {awaiting.map((d, i) => (
              <Pressable
                key={d.id}
                onPress={() => router.push({ pathname: '/enterprise/donations/[id]', params: { id: d.id } })}
                accessibilityRole="button"
                accessibilityLabel={`${d.foodName}, reserved by ${d.reservation?.ngoName}. View details`}
                style={({ pressed }) => [styles.awaitingRow, i > 0 && styles.divider, pressed && styles.rowPressed]}>
                <View style={styles.awaitingIcon}>
                  <Icon name="ngo" size={20} color={ServdColors.teal} />
                </View>
                <View style={styles.awaitingText}>
                  <Text style={styles.awaitingTitle}>{d.foodName}</Text>
                  <Text style={styles.awaitingMeta}>
                    {d.reservation?.ngoName} · {d.collectionLocation}
                  </Text>
                  {d.reservation ? (
                    <Text style={styles.awaitingMeta}>Reserved {formatDateTime(d.reservation.reservedAt)}</Text>
                  ) : null}
                </View>
                <Icon name="chevronRight" size={18} color={ServdColors.textMuted} />
              </Pressable>
            ))}
          </Card>
        </>
      ) : null}

      <SectionTitle>Enterprise Services</SectionTitle>
      <View style={styles.services}>
        <ServiceCard
          title="Create Donation"
          description="List surplus food for NGOs to reserve."
          onPress={() => router.push('/enterprise/create-donation')}
        />
        <ServiceCard
          title="My Donations"
          description="View, edit or cancel the food you've listed."
          onPress={() => openList()}
        />
        <ServiceCard
          title="Reservations"
          description="See which NGOs have reserved your donations."
          badge={awaiting.length || undefined}
          onPress={() => openList('Reserved')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    gap: 10,
  },
  overview: {
    gap: 14,
  },
  overviewLabel: {
    ...ServdType.body,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  statPressed: {
    backgroundColor: '#FFFFFF',
  },
  statValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    ...ServdType.caption,
    color: ServdColors.text,
  },
  awaitingCard: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  awaitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: ServdColors.border,
  },
  rowPressed: {
    backgroundColor: ServdColors.background,
  },
  awaitingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ServdColors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  awaitingText: {
    flex: 1,
    gap: 1,
  },
  awaitingTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    color: ServdColors.olive,
  },
  awaitingMeta: {
    ...ServdType.caption,
  },
  services: {
    gap: 14,
  },
});
