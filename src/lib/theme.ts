export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    bg: string;
    bg2: string;
    bg3: string;
    ink: string;
    muted: string;
    muted2: string;
    border: string;
    accent: string;
  };
}

export const colors = {
  ink: '#0A0A0A',
  cream: '#F7F3EE',
  surface: '#EDE8E0',
  surface2: '#E3DDD5',
  muted: '#9A9289',
  muted2: '#C8C2BB',
  accent: '#5B4C3F',
  teleport: '#7C5CBF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  display: {
    fontFamily: 'System',
    fontWeight: '300' as const,
    fontSize: 52,
    letterSpacing: 14,
  },
  heading: {
    fontFamily: 'System',
    fontWeight: '300' as const,
    fontSize: 38,
    lineHeight: 42,
  },
  title: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '300' as const,
    fontSize: 14,
    lineHeight: 22,
  },
  caption: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 12,
    letterSpacing: 1,
  },
  label: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    bg: colors.cream,
    bg2: colors.surface,
    bg3: colors.surface2,
    ink: colors.ink,
    muted: colors.muted,
    muted2: colors.muted2,
    border: 'rgba(10,10,10,0.1)',
    accent: colors.accent,
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    bg: colors.ink,
    bg2: '#141414',
    bg3: '#1E1E1E',
    ink: colors.cream,
    muted: '#7A736C',
    muted2: '#3A3530',
    border: 'rgba(247,243,238,0.09)',
    accent: '#C8BFB5',
  },
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const THEME_STORAGE_KEY = '@vicinity_theme';