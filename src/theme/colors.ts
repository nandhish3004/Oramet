/**
 * OraMet - Official Disaster Management Design Tokens
 * Ambient Clarity Design System (Stitch Export Edition)
 */

export const Colors = {
  // Designer Warm Minimalist Canvas & Surfaces (Ref: Terracotta & Cream Edition)
  bg: {
    primary: '#F8F6F2', // Warm cream canvas
    secondary: '#FFFFFF',
    card: '#FFFFFF',
    cardMuted: '#F0EEE9', // Soft warm oyster beige
    glass: 'rgba(248, 246, 242, 0.94)',
    glassBorder: '#E5E0D8',
    elevated: '#F2EFE9',
    input: '#F0EEE9',
    inputFocused: '#E5E0D8',
    dark: '#1F1A17', // Deep espresso charcoal
  },

  // Warm Espresso Typography
  text: {
    primary: '#1F1A17', // Deep warm charcoal espresso
    secondary: '#827C77', // Muted oyster brown
    tertiary: '#A49E98',
    muted: '#B0AAA4',
    inverse: '#FFFFFF',
  },

  // Designer Palette Accents
  accent: {
    terracotta: '#8C5338', // Iconic primary warm terracotta from reference
    terracottaDark: '#733F27',
    terracottaLight: '#F5ECE6',
    charcoal: '#1F1A17',
    warmBeige: '#F0EEE9',
    amber: '#C2843A',
    amberDark: '#9C6222',
    amberGlow: 'rgba(194, 132, 58, 0.15)',
    cyan: '#005BBF',
    cyanDark: '#004493',
    cyanGlow: 'rgba(0, 91, 191, 0.15)',
    cyanLight: '#D8E2FF',
    teal: '#006A61',
    tealLight: '#86F2E4',
    // Commercial tokens preserved
    instamartOrange: '#FF5200',
    swiggyOrange: '#8C5338', // Unified with terracotta
    blinkitGreen: '#0C831F',
    googleBlue: '#1A73E8',
    googleRed: '#EA4335',
    googleYellow: '#FBBC05',
    googleGreen: '#34A853',
    microsoftSlate: '#1F1A17',
  },

  // Disaster Tiers
  severity: {
    low: { bg: '#86F2E4', text: '#006F66', accent: '#006A61' },
    moderate: { bg: '#FFDDB8', text: '#653E00', accent: '#A66900' },
    high: { bg: '#FFEDD5', text: '#C2410C', accent: '#EA580C' },
    critical: { bg: '#FFDAD6', text: '#BA1A1A', accent: '#93000A' },
  },

  // Status
  status: {
    success: '#006A61',
    warning: '#A66900',
    error: '#BA1A1A',
    info: '#005BBF',
    online: '#006A61',
    offline: '#845300',
  },

  // Outlines & Borders
  border: {
    subtle: '#DFE3E8',
    default: '#C1C6D6',
    strong: '#727785',
  },

  // Gradients
  gradient: {
    primary: ['#F7F9FF', '#F1F4FA', '#EBEEF4'],
    card: ['#FFFFFF', '#F7F9FF'],
    accent: ['#005BBF', '#1A73E8'],
    warm: ['#FFDDB8', '#A66900'],
    danger: ['#FFDAD6', '#BA1A1A'],
    hero: ['#F7F9FF', '#D8E2FF', '#EBEEF4'],
    welcome: ['#F7F9FF', '#EDF2FA', '#D8E2FF'],
  },

  // Elevation Shadows
  shadow: {
    glow: {
      shadowColor: '#005BBF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    card: {
      shadowColor: '#181C20',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    subtle: {
      shadowColor: '#181C20',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
  display: 56,
};
