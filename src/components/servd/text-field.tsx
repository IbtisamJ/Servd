import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { ServdColors, ServdRadius, ServdType } from '@/constants/servd-theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  helper?: ReactNode;
  /** Show a "12/250" counter under the field. */
  showCount?: boolean;
  optional?: boolean;
};

/** Input styled to match the registration form: bold label, rounded field, red border + message on error. */
export function TextField({
  label,
  error,
  helper,
  showCount,
  optional,
  value = '',
  maxLength,
  multiline,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? ServdColors.red : focused ? ServdColors.teal : ServdColors.border;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>
        {label}
        {optional ? <Text style={styles.optional}> (optional)</Text> : null}
      </Text>
      <TextInput
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        placeholderTextColor={ServdColors.textMuted}
        accessibilityLabel={label}
        accessibilityHint={error}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          multiline && styles.multiline,
          { borderColor, borderWidth: error || focused ? 1.5 : 1 },
        ]}
        {...rest}
      />
      {error || helper || showCount ? (
        <View style={styles.footer}>
          <View style={styles.footerText}>
            {error ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : typeof helper === 'string' ? (
              <Text style={styles.helper}>{helper}</Text>
            ) : (
              helper
            )}
          </View>
          {showCount && maxLength ? (
            <Text style={[styles.count, value.length >= maxLength && { color: ServdColors.red }]}>
              {value.length}/{maxLength}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    ...ServdType.label,
  },
  optional: {
    fontWeight: '400',
    color: ServdColors.textSecondary,
  },
  input: {
    minHeight: 54,
    borderRadius: ServdRadius.md,
    backgroundColor: ServdColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: ServdColors.text,
    // We draw our own teal focus border; hide the browser outline on web.
    outlineWidth: 0,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  footerText: {
    flex: 1,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    color: ServdColors.red,
  },
  helper: {
    ...ServdType.caption,
  },
  count: {
    ...ServdType.caption,
    fontVariant: ['tabular-nums'],
  },
});
