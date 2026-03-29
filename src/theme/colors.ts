import React, { createContext, useContext, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export const accentOptions = [
  { label: 'Azul', value: '#0066cc' },
  { label: 'Verde', value: '#12D18E' },
  { label: 'Morado', value: '#8B5CF6' },
  { label: 'Naranja', value: '#F97316' },
  { label: 'Rosa', value: '#EC4899' },
  { label: 'Rojo', value: '#EF4444' },
];

const darkPalette = {
  background: '#070D1A',
  card: '#131D31',
  text: {
    primary: '#FFFFFF',
    secondary: '#AAB5C8',
    muted: '#7D8CA3',
    inverse: '#051018',
  },
  input: {
    background: '#1A2840',
    border: '#334863',
  },
};

const lightPalette = {
  background: '#EEF4FF',
  card: '#FFFFFF',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    inverse: '#FFFFFF',
  },
  input: {
    background: '#F8FAFC',
    border: '#CBD5E1',
  },
};

const toRgb = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  const normalizedHex = cleanHex.length === 3
    ? cleanHex.split('').map((char) => `${char}${char}`).join('')
    : cleanHex;
  const num = Number.parseInt(normalizedHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const toHex = (value: number) => {
  const normalized = Math.max(0, Math.min(255, Math.round(value)));
  return normalized.toString(16).padStart(2, '0').toUpperCase();
};

const darken = (hex: string, amount: number) => {
  const { r, g, b } = toRgb(hex);
  const factor = 1 - amount;
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
};

const buildColors = (mode: ThemeMode, accent: string) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  return {
    ...palette,
    primary: accent,
    primaryDark: darken(accent, 0.2),
    input: {
      ...palette.input,
      borderFocus: accent,
    },
    status: {
      optimal: accent,
      warning: '#F59E0B',
      danger: '#EF4444',
    },
  };
};

export type ThemeColors = ReturnType<typeof buildColors>;

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  accent: string;
  toggleMode: () => void;
  setAccent: (value: string) => void;
}

const defaultAccent = accentOptions[0].value;

const ThemeContext = createContext<ThemeContextValue>({
  colors: buildColors('dark', defaultAccent),
  mode: 'dark',
  accent: defaultAccent,
  toggleMode: () => undefined,
  setAccent: () => undefined,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [accent, setAccent] = useState(defaultAccent);

  const colors = useMemo(() => buildColors(mode, accent), [mode, accent]);

  const value = useMemo(
    () => ({
      colors,
      mode,
      accent,
      toggleMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
      setAccent,
    }),
    [colors, mode, accent]
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = () => useContext(ThemeContext);
