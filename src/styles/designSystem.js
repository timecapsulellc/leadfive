/**
 * LeadFive Design System
 * Comprehensive design tokens, patterns, and utilities
 */

// ============ COLOR SYSTEM ============
export const COLORS = {
  // Primary Brand Colors
  primary: {
    50: '#f0fdff',
    100: '#ccfbff',
    200: '#99f6ff',
    300: '#66f2ff',
    400: '#33edff',
    500: '#00E5FF', // Main brand color
    600: '#00bcd4',
    700: '#0097a7',
    800: '#00727a',
    900: '#003d4a',
  },

  // Secondary Colors
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },

  // Semantic Colors
  semantic: {
    success: {
      50: '#f0fdf4',
      500: '#4ADE80',
      600: '#16a34a',
      900: '#14532d',
    },
    error: {
      50: '#fef2f2',
      500: '#EF4444',
      600: '#dc2626',
      900: '#7f1d1d',
    },
    warning: {
      50: '#fffbeb',
      500: '#F59E0B',
      600: '#d97706',
      900: '#78350f',
    },
    info: {
      50: '#eff6ff',
      500: '#3B82F6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
  },

  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Glassmorphism Colors
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    dark: 'rgba(0, 0, 0, 0.1)',
    backdrop: 'rgba(255, 255, 255, 0.05)',
  },
};

// ============ SPACING SYSTEM ============
export const SPACING = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// ============ TYPOGRAPHY SYSTEM ============
export const TYPOGRAPHY = {
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
    display: ['Cal Sans', 'Inter', 'sans-serif'],
  },

  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============ SHADOWS & ELEVATION ============
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Brand-specific shadows
  glow: {
    primary: '0 0 20px rgba(0, 229, 255, 0.3)',
    secondary: '0 0 20px rgba(217, 70, 239, 0.3)',
    success: '0 0 20px rgba(74, 222, 128, 0.3)',
    error: '0 0 20px rgba(239, 68, 68, 0.3)',
  },

  glassmorphism: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};

// ============ BORDER RADIUS ============
export const RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

// ============ ANIMATIONS & TRANSITIONS ============
export const ANIMATIONS = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms',
  },

  easing: {
    linear: 'linear',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    bounce: {
      '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
      '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
      '70%': { transform: 'translate3d(0, -15px, 0)' },
      '90%': { transform: 'translate3d(0, -4px, 0)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },
};

// ============ BREAKPOINTS ============
export const BREAKPOINTS = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============ Z-INDEX SCALE ============
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// ============ COMPONENT VARIANTS ============
export const COMPONENT_VARIANTS = {
  button: {
    primary: {
      background: COLORS.primary[500],
      color: 'white',
      border: 'none',
      shadow: SHADOWS.md,
      hover: {
        background: COLORS.primary[600],
        shadow: SHADOWS.lg,
      },
    },
    secondary: {
      background: 'transparent',
      color: COLORS.primary[500],
      border: `1px solid ${COLORS.primary[500]}`,
      hover: {
        background: COLORS.primary[50],
        color: COLORS.primary[600],
      },
    },
    ghost: {
      background: 'transparent',
      color: COLORS.neutral[700],
      border: 'none',
      hover: {
        background: COLORS.neutral[100],
      },
    },
  },

  card: {
    default: {
      background: 'white',
      border: `1px solid ${COLORS.neutral[200]}`,
      borderRadius: RADIUS.lg,
      shadow: SHADOWS.sm,
    },
    elevated: {
      background: 'white',
      border: 'none',
      borderRadius: RADIUS.xl,
      shadow: SHADOWS.lg,
    },
    glass: {
      background: COLORS.glass.light,
      border: `1px solid ${COLORS.glass.medium}`,
      borderRadius: RADIUS.xl,
      shadow: SHADOWS.glassmorphism,
      backdropFilter: 'blur(20px)',
    },
  },

  input: {
    default: {
      background: 'white',
      border: `1px solid ${COLORS.neutral[300]}`,
      borderRadius: RADIUS.md,
      padding: `${SPACING[2]} ${SPACING[3]}`,
      focus: {
        borderColor: COLORS.primary[500],
        shadow: `0 0 0 3px ${COLORS.primary[100]}`,
      },
    },
  },
};

// ============ UTILITY FUNCTIONS ============
export const UTILS = {
  // Color utilities
  rgba: (color, alpha) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Responsive utilities
  responsive: values => {
    const breakpointKeys = Object.keys(BREAKPOINTS);
    return breakpointKeys.reduce((acc, breakpoint, index) => {
      if (values[breakpoint]) {
        const mediaQuery =
          index === 0 ? '' : `@media (min-width: ${BREAKPOINTS[breakpoint]})`;
        acc[mediaQuery || '&'] = values[breakpoint];
      }
      return acc;
    }, {});
  },

  // Animation utilities
  transition: (
    properties = 'all',
    duration = ANIMATIONS.duration.normal,
    easing = ANIMATIONS.easing.easeOut
  ) => {
    return `${properties} ${duration} ${easing}`;
  },

  // Focus utilities
  focusRing: (color = COLORS.primary[500]) => ({
    outline: 'none',
    boxShadow: `0 0 0 3px ${UTILS.rgba(color, 0.2)}`,
  }),
};

// ============ THEME CONFIGURATION ============
export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  radius: RADIUS,
  animations: ANIMATIONS,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  components: COMPONENT_VARIANTS,
  utils: UTILS,
};

// Export everything as default
export default THEME;
