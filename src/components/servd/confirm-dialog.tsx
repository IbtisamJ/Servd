import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/servd/button';
import { Icon, type IconName } from '@/components/servd/icon';
import { ServdColors, ServdRadius } from '@/constants/servd-theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: IconName;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * In-app confirmation sheet. Used instead of Alert.alert so the copy can be
 * styled and it also works on web.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Go back',
  destructive = false,
  icon,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const accent = destructive ? ServdColors.red : ServdColors.teal;
  const tint = destructive ? ServdColors.redTint : ServdColors.tealTint;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onCancel} accessibilityLabel="Close" />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={[styles.iconCircle, { backgroundColor: tint }]}>
            <Icon name={icon ?? (destructive ? 'warning' : 'info')} size={26} color={accent} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
            />
            <Button label={cancelLabel} variant="ghost" onPress={onCancel} disabled={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: ServdColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: ServdColors.surface,
    borderRadius: ServdRadius.xl,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: ServdColors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: ServdColors.textSecondary,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: ServdColors.red,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 4,
    marginTop: 10,
  },
});
