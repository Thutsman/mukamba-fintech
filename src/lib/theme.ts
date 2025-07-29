// Define color types more explicitly
type ColorShades = {
  DEFAULT: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

type SimpleColorShades = {
  DEFAULT: string;
  light: string;
  dark: string;
};

type ThemeColors = {
  primary: ColorShades;
  success: SimpleColorShades;
  warning: SimpleColorShades;
  danger: SimpleColorShades;
  neutral: ColorShades;
};

export const theme = {
  colors: {
    primary: {
      DEFAULT: '#2563EB', // blue-600
      50: '#EFF6FF',     // blue-50
      100: '#DBEAFE',    // blue-100
      200: '#BFDBFE',    // blue-200
      300: '#93C5FD',    // blue-300
      400: '#60A5FA',    // blue-400
      500: '#3B82F6',    // blue-500
      600: '#2563EB',    // blue-600
      700: '#1D4ED8',    // blue-700
      800: '#1E40AF',    // blue-800
      900: '#1E3A8A',    // blue-900
    },
    success: {
      DEFAULT: '#10B981', // emerald-500
      light: '#D1FAE5',   // emerald-100
      dark: '#059669',    // emerald-600
    },
    warning: {
      DEFAULT: '#F59E0B', // amber-500
      light: '#FEF3C7',   // amber-100
      dark: '#D97706',    // amber-600
    },
    danger: {
      DEFAULT: '#EF4444', // red-500
      light: '#FEE2E2',   // red-100
      dark: '#DC2626',    // red-600
    },
    neutral: {
      DEFAULT: '#6B7280', // gray-500
      50: '#F8FAFC',      // slate-50 (app background)
      100: '#F1F5F9',     // slate-100 (hover states)
      200: '#E2E8F0',     // slate-200 (active states)
      300: '#CBD5E1',     // slate-300
      400: '#94A3B8',     // slate-400
      500: '#64748B',     // slate-500
      600: '#475569',     // slate-600
      700: '#334155',     // slate-700
      800: '#1E293B',     // slate-800
      900: '#0F172A',     // slate-900
    },
  } as ThemeColors,
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  typography: {
    fonts: {
      sans: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  transitions: {
    DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Utility types
export type ThemeColor = keyof ThemeColors;
export type ThemeColorShade = keyof ColorShades | keyof SimpleColorShades;
export type ThemeShadow = keyof typeof theme.shadows;
export type ThemeSpacing = keyof typeof theme.spacing;
export type ThemeRadius = keyof typeof theme.borderRadius;
export type ThemeFontSize = keyof typeof theme.typography.sizes;
export type ThemeFontWeight = keyof typeof theme.typography.weights;

// Helper functions
export const getColor = (color: ThemeColor, shade?: ThemeColorShade) => {
  const colorSet = theme.colors[color];
  return shade ? colorSet[shade as keyof typeof colorSet] : colorSet.DEFAULT;
};

export const getShadow = (size: ThemeShadow) => theme.shadows[size];
export const getSpacing = (size: ThemeSpacing) => theme.spacing[size];
export const getRadius = (size: ThemeRadius) => theme.borderRadius[size];
export const getFontSize = (size: ThemeFontSize) => theme.typography.sizes[size];
export const getFontWeight = (weight: ThemeFontWeight) => theme.typography.weights[weight]; 