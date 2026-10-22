import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/servd/icon';
import { ServdColors } from '@/constants/servd-theme';

export function LoadingState({ label = 'Loading donations…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator color={ServdColors.teal} />
      <Text style={styles.message}>{label}</Text>
    </View>
  );
}

type EmptyProps = {
  icon?: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
};

export function EmptyState({ icon = 'box', title, message, action }: EmptyProps) {
  return (
    <View style={styles.center}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={28} color={ServdColors.teal} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
    gap: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ServdColors.tealTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: ServdColors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    color: ServdColors.textSecondary,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
