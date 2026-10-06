// =============================================================================
// PRESSKIT - Theme Configuration
// =============================================================================

import { ThemeName } from '@/types';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  vibe: string;
  description: string;
  preview: string;
  isPremium: boolean;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  style: {
    borderRadius: string;
    heroLayout: 'centered' | 'split' | 'fullbleed' | 'asymmetric';
    sectionSpacing: 'compact' | 'normal' | 'spacious';
    imageStyle: 'square' | 'rounded' | 'circle';
  };
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    vibe: 'Clean',
    description: 'Magazine-style layout with bold typography and strong composition',
    preview: '/themes/editorial.jpg',
    isPremium: false,
    colors: {
      background: '#ffffff',
      foreground: '#0a0a0a',
      card: '#fafafa',
      cardForeground: '#0a0a0a',
      primary: '#0a0a0a',
      primaryForeground: '#ffffff',
      secondary: '#f4f4f5',
      secondaryForeground: '#0a0a0a',
      muted: '#f4f4f5',
      mutedForeground: '#71717a',
      accent: '#0a0a0a',
      accentForeground: '#ffffff',
      border: '#e4e4e7',
    },
    fonts: {
      heading: 'font-serif',
      body: 'font-sans',
    },
    style: {
      borderRadius: '0',
      heroLayout: 'split',
      sectionSpacing: 'spacious',
      imageStyle: 'square',
    },
  },
  night: {
    id: 'night',
    name: 'Night',
    vibe: 'Dark',
    description: 'Dark, concert-oriented design with large imagery',
    preview: '/themes/night.jpg',
    isPremium: false,
    colors: {
      background: '#09090b',
      foreground: '#fafafa',
      card: '#18181b',
      cardForeground: '#fafafa',
      primary: '#fafafa',
      primaryForeground: '#09090b',
      secondary: '#27272a',
      secondaryForeground: '#fafafa',
      muted: '#27272a',
      mutedForeground: '#a1a1aa',
      accent: '#fafafa',
      accentForeground: '#09090b',
      border: '#27272a',
    },
    fonts: {
      heading: 'font-sans',
      body: 'font-sans',
    },
    style: {
      borderRadius: '0.5rem',
      heroLayout: 'fullbleed',
      sectionSpacing: 'normal',
      imageStyle: 'rounded',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    vibe: 'Minimal',
    description: 'Clean and professional with plenty of whitespace',
    preview: '/themes/minimal.jpg',
    isPremium: false,
    colors: {
      background: '#fafafa',
      foreground: '#171717',
      card: '#ffffff',
      cardForeground: '#171717',
      primary: '#171717',
      primaryForeground: '#fafafa',
      secondary: '#f5f5f5',
      secondaryForeground: '#171717',
      muted: '#f5f5f5',
      mutedForeground: '#737373',
      accent: '#171717',
      accentForeground: '#fafafa',
      border: '#e5e5e5',
    },
    fonts: {
      heading: 'font-sans',
      body: 'font-sans',
    },
    style: {
      borderRadius: '0.25rem',
      heroLayout: 'centered',
      sectionSpacing: 'spacious',
      imageStyle: 'circle',
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    vibe: 'Bold',
    description: 'Modern nightlife aesthetic with vibrant energy',
    preview: '/themes/neon.jpg',
    isPremium: true,
    colors: {
      background: '#0c0a1d',
      foreground: '#f8fafc',
      card: '#1a1632',
      cardForeground: '#f8fafc',
      primary: '#c084fc',
      primaryForeground: '#0c0a1d',
      secondary: '#241f47',
      secondaryForeground: '#f8fafc',
      muted: '#241f47',
      mutedForeground: '#94a3b8',
      accent: '#22d3ee',
      accentForeground: '#0c0a1d',
      border: '#312e5a',
    },
    fonts: {
      heading: 'font-sans',
      body: 'font-sans',
    },
    style: {
      borderRadius: '1rem',
      heroLayout: 'asymmetric',
      sectionSpacing: 'normal',
      imageStyle: 'rounded',
    },
  },
};

export const FONT_PAIRINGS = [
  { id: 'modern', heading: 'Inter', body: 'Inter', label: 'Modern (Inter)' },
  { id: 'editorial', heading: 'Playfair Display', body: 'Source Sans 3', label: 'Editorial' },
  { id: 'bold', heading: 'Bebas Neue', body: 'Roboto', label: 'Bold' },
  { id: 'elegant', heading: 'Cormorant Garamond', body: 'Lato', label: 'Elegant' },
  { id: 'minimal', heading: 'DM Sans', body: 'DM Sans', label: 'Minimal' },
];

export const ACCENT_COLORS = [
  { id: 'default', value: 'theme', label: 'Theme Default' },
  { id: 'red', value: '#ef4444', label: 'Red' },
  { id: 'orange', value: '#f97316', label: 'Orange' },
  { id: 'amber', value: '#f59e0b', label: 'Amber' },
  { id: 'emerald', value: '#10b981', label: 'Emerald' },
  { id: 'cyan', value: '#06b6d4', label: 'Cyan' },
  { id: 'blue', value: '#3b82f6', label: 'Blue' },
  { id: 'violet', value: '#8b5cf6', label: 'Violet' },
  { id: 'pink', value: '#ec4899', label: 'Pink' },
];

export function getTheme(themeName: ThemeName): ThemeConfig {
  return THEMES[themeName] || THEMES.editorial;
}

export function getAllThemes(): ThemeConfig[] {
  return Object.values(THEMES);
}

export function getFreeThemes(): ThemeConfig[] {
  return Object.values(THEMES).filter((t) => !t.isPremium);
}

export function getPremiumThemes(): ThemeConfig[] {
  return Object.values(THEMES).filter((t) => t.isPremium);
}
