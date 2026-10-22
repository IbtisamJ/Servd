import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/servd/icon';
import { ServdColors, ServdRadius } from '@/constants/servd-theme';

type Variant = 'primary' | 'danger' | 'success' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, { bg: string; pressed: string; fg: string; border?: string }> = {
  primary: { bg: ServdColors.teal, pressed: ServdColors.tealPressed, fg: '#FFFFFF' },
  danger: { bg: ServdColors.red, pressed: ServdColors.redPressed, fg: '#FFFFFF' },
  success: { bg: ServdColors.olive, pressed: ServdColors.olivePressed, fg: '#FFFFFF' },
  secondary: {
    bg: ServdColors.surface,
    pressed: ServdColors.tealTint,
    fg: ServdColors.teal,
    border: ServdColors.teal,
  },
  ghost: { bg: 'transparent', pressed: ServdColors.tealTint, fg: ServdColors.teal },
};

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  loadingLabel,
  disabled = false,
  compact = false,
  style,
  accessibilityHint,
}: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: pressed ? v.pressed : v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1.5 : 0,
        },
        disabled && !loading && styles.disabled,
        style,
      ]}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={v.fg} />
        ) : icon ? (
          <Icon name={icon} size={compact ? 16 : 18} color={v.fg} />
        ) : null}
        <Text style={[styles.label, compact && styles.labelCompact, { color: v.fg }]} numberOfLines={1}>
          {loading && loadingLabel ? loadingLabel : label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: ServdRadius.md,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compact: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: ServdRadius.pill,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
  },
  labelCompact: {
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.45,
  },
});
