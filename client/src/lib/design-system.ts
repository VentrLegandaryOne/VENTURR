/**
 * Venturr Design System
 * Google-level design standards for consistent UI/UX
 */

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  
  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  
  // Neutral Grays
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

// Spacing System (8px grid)
export const spacing = {
  0: '0px',
  1: '4px',    // 0.25rem
  2: '8px',    // 0.5rem
  3: '12px',   // 0.75rem
  4: '16px',   // 1rem
  5: '20px',   // 1.25rem
  6: '24px',   // 1.5rem
  8: '32px',   // 2rem
  10: '40px',  // 2.5rem
  12: '48px',  // 3rem
  16: '64px',  // 4rem
  20: '80px',  // 5rem
  24: '96px',  // 6rem
};

// Typography Scale
export const typography = {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  
  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Border Radius
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Z-Index Scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Component Styles
export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary[600],
      color: '#ffffff',
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: borderRadius.md,
      fontWeight: typography.fontWeight.medium,
      transition: transitions.base,
      hover: {
        backgroundColor: colors.primary[700],
      },
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[900],
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: borderRadius.md,
      fontWeight: typography.fontWeight.medium,
      transition: transitions.base,
      hover: {
        backgroundColor: colors.neutral[200],
      },
    },
    danger: {
      backgroundColor: colors.error[600],
      color: '#ffffff',
      padding: `${spacing[3]} ${spacing[6]}`,
      borderRadius: borderRadius.md,
      fontWeight: typography.fontWeight.medium,
      transition: transitions.base,
      hover: {
        backgroundColor: colors.error[700],
      },
    },
  },
  
  input: {
    base: {
      padding: `${spacing[3]} ${spacing[4]}`,
      borderRadius: borderRadius.md,
      border: `1px solid ${colors.neutral[300]}`,
      fontSize: typography.fontSize.base,
      transition: transitions.base,
      focus: {
        borderColor: colors.primary[500],
        outline: `2px solid ${colors.primary[200]}`,
      },
      error: {
        borderColor: colors.error[500],
      },
    },
  },
  
  card: {
    base: {
      backgroundColor: '#ffffff',
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      boxShadow: shadows.base,
    },
  },
};

// Utility Functions
export const getColor = (colorPath: string): string => {
  const [colorName, shade] = colorPath.split('.');
  const colorObj = colors[colorName as keyof typeof colors];
  if (colorObj && typeof colorObj === 'object') {
    return colorObj[shade as keyof typeof colorObj] || colorObj[500];
  }
  return colors.neutral[500];
};

export const getSpacing = (size: keyof typeof spacing): string => {
  return spacing[size];
};

export const getFontSize = (size: keyof typeof typography.fontSize): string => {
  return typography.fontSize[size];
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  components,
  getColor,
  getSpacing,
  getFontSize,
};

