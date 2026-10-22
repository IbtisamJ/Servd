/**
 * Servd brand palette — sampled from the shared NGO + auth screens so the
 * Food Enterprise flow looks like the same app.
 *
 * The app is light-only for now (every team screen uses the cream background),
 * so these are plain values rather than light/dark pairs.
 */
export const ServdColors = {
  background: '#FFF7F2',
  surface: '#FFFFFF',
  surfaceMuted: '#F1E6D2',

  teal: '#0B7F7E',
  tealPressed: '#086766',
  tealTint: '#E3F1F0',

  olive: '#7B9C45',
  olivePressed: '#66833A',
  oliveTint: '#EAF1E1',

  red: '#C62828',
  redPressed: '#A32020',
  redTint: '#FBE9E7',

  amber: '#8A5A12',
  amberTint: '#FDF0CF',

  slate: '#55606B',
  slateTint: '#ECEEF0',

  text: '#2B2A27',
  textSecondary: '#6B6964',
  textMuted: '#9A968F',

  border: '#E8E2DC',
  borderStrong: '#D5CDC4',
  overlay: 'rgba(30, 24, 18, 0.45)',
} as const;

export const ServdRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const ServdSpace = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const ServdType = {
  pageTitle: { fontSize: 34, lineHeight: 40, fontWeight: '500' as const, color: ServdColors.teal },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '500' as const, color: ServdColors.teal },
  cardTitle: { fontSize: 22, lineHeight: 28, fontWeight: '400' as const, color: ServdColors.olive },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' as const, color: ServdColors.text },
  bodySecondary: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const, color: ServdColors.textSecondary },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const, color: ServdColors.text },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, color: ServdColors.textSecondary },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700' as const,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
    color: ServdColors.teal,
  },
} as const;

export const ServdShadow = {
  card: {
    boxShadow: '0px 4px 12px rgba(90, 70, 50, 0.06)',
  },
} as const;
