import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/servd/icon';
import { ServdColors, ServdRadius } from '@/constants/servd-theme';

type Tone = 'success' | 'info' | 'warning' | 'error';

const TONES: Record<Tone, { bg: string; accent: string; icon: IconName }> = {
  success: { bg: ServdColors.oliveTint, accent: ServdColors.olive, icon: 'check' },
  info: { bg: ServdColors.surfaceMuted, accent: ServdColors.teal, icon: 'info' },
  warning: { bg: ServdColors.amberTint, accent: ServdColors.amber, icon: 'warning' },
  error: { bg: ServdColors.redTint, accent: ServdColors.red, icon: 'error' },
};

type Props = {
  tone?: Tone;
  title: string;
  message?: string;
  icon?: IconName;
  onDismiss?: () => void;
};

/** Callout with a coloured left edge, like the "What happens next?" box on the review screen. */
export function Banner({ tone = 'info', title, message, icon, onDismiss }: Props) {
  const t = TONES[tone];
  return (
    <View
      style={[styles.box, { backgroundColor: t.bg, borderLeftColor: t.accent }]}
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite">
      <Icon name={icon ?? t.icon} size={20} color={t.accent} style={styles.icon} />
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss message">
          <Icon name="close" size={18} color={ServdColors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: ServdRadius.lg,
    borderLeftWidth: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginTop: 1,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: ServdColors.text,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    color: ServdColors.textSecondary,
  },
});
