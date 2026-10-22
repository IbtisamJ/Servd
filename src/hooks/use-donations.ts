/**
 * Small client-side cache for the signed-in enterprise's donations.
 * Screens read through these hooks; mutations go through the actions below so
 * every screen (dashboard, list, details) updates together.
 */
import { useFocusEffect } from 'expo-router';
import { useCallback, useSyncExternalStore } from 'react';

import * as api from '@/services/donation-service';
import type { Donation, DonationInput } from '@/types/donation';

type DonationsState = {
  donations: Donation[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
};

let state: DonationsState = { donations: [], status: 'idle', error: null };
const listeners = new Set<() => void>();

function setState(patch: Partial<DonationsState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;

function upsert(donation: Donation) {
  const exists = state.donations.some((d) => d.id === donation.id);
  setState({
    donations: exists
      ? state.donations.map((d) => (d.id === donation.id ? donation : d))
      : [donation, ...state.donations],
  });
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

let inflight: Promise<void> | null = null;

export function refreshDonations(): Promise<void> {
  if (inflight) return inflight;
  if (state.status !== 'ready') setState({ status: 'loading', error: null });
  inflight = api
    .listEnterpriseDonations()
    .then((donations) => setState({ donations, status: 'ready', error: null }))
    .catch((error) =>
      setState({ status: state.donations.length ? 'ready' : 'error', error: errorMessage(error) })
    )
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useEnterpriseDonations() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useFocusEffect(
    useCallback(() => {
      refreshDonations();
    }, [])
  );

  return {
    donations: snapshot.donations,
    error: snapshot.error,
    isLoading: snapshot.status === 'idle' || snapshot.status === 'loading',
    hasError: snapshot.status === 'error',
    refresh: refreshDonations,
  };
}

export function useDonation(id: string | undefined) {
  const { donations, isLoading, hasError, error, refresh } = useEnterpriseDonations();
  const donation = id ? donations.find((d) => d.id === id) : undefined;
  return {
    donation,
    isLoading: !donation && isLoading,
    notFound: !donation && !isLoading && !hasError,
    error,
    refresh,
  };
}

/**
 * One-shot confirmation messages passed to the details screen after a
 * create/edit, so it can show "Donation listed" without relying on URL params.
 */
export type DonationNotice = 'created' | 'updated' | 'cancelled';
const notices = new Map<string, DonationNotice>();

export function setDonationNotice(id: string, notice: DonationNotice) {
  notices.set(id, notice);
}

export function takeDonationNotice(id: string): DonationNotice | undefined {
  const notice = notices.get(id);
  notices.delete(id);
  return notice;
}

export async function createDonation(input: DonationInput): Promise<Donation> {
  const donation = await api.createDonation(input);
  upsert(donation);
  return donation;
}

export async function updateDonation(id: string, input: DonationInput): Promise<Donation> {
  const donation = await api.updateDonation(id, input);
  upsert(donation);
  return donation;
}

export async function cancelDonation(id: string): Promise<Donation> {
  const donation = await api.cancelDonation(id);
  upsert(donation);
  return donation;
}
