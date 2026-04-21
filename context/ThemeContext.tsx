import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  white: string;
  black: string;
  cardBlue: string;
  cardPurple: string;
  cardTeal: string;
  cardRose: string;
  cardAmber: string;
  cardGreen: string;
};

const darkColors: ThemeColors = {
  primary: '#6C63FF',
  primaryDark: '#5A52E0',
  primaryLight: '#E8E6FF',
  secondary: '#FF6584',
  accent: '#43CFCF',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#293548',
  surfaceBorder: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  cardBlue: '#1D3557',
  cardPurple: '#2D1B69',
  cardTeal: '#0F3D3E',
  cardRose: '#3D1F2D',
  cardAmber: '#3D2C0A',
  cardGreen: '#0D3321',
};

const lightColors: ThemeColors = {
  primary: '#6C63FF',
  primaryDark: '#5A52E0',
  primaryLight: '#EEF2FF',
  secondary: '#FF6584',
  accent: '#0EA5A0',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
  white: '#FFFFFF',
  black: '#000000',
  cardBlue: '#DBEAFE',
  cardPurple: '#EDE9FE',
  cardTeal: '#CCFBF1',
  cardRose: '#FFE4E6',
  cardAmber: '#FEF3C7',
  cardGreen: '#DCFCE7',
};

type ThemeContextType = {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'dark',
  isDark: true,
  colors: darkColors,
  setThemeMode: () => {},
  accentColor: '#6C63FF',
  setAccentColor: () => {},
});

const ACCENT_PRESETS = ['#6C63FF', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColorState] = useState('#6C63FF');

  useEffect(() => {
    AsyncStorage.multiGet(['theme_mode', 'accent_color']).then(([[, mode], [, accent]]) => {
      if (mode) setThemeModeState(mode as ThemeMode);
      if (accent) setAccentColorState(accent);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('theme_mode', mode);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    AsyncStorage.setItem('accent_color', color);
  };

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const baseColors = isDark ? darkColors : lightColors;
  const colors: ThemeColors = {
    ...baseColors,
    primary: accentColor,
    primaryDark: accentColor + 'CC',
  };

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, colors, setThemeMode, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export { ACCENT_PRESETS };
