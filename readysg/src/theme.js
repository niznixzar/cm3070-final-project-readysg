// Colours from OUI (oui.open.gov.sg). OUI is web-only, so the app uses
// React Native Paper with OUI's colours. OUI has no dark palette, so the dark
// colours are picked from its colour scales.
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#1361f0', // OUI blue 500
  onPrimary: '#ffffff',
  primaryContainer: '#e7effc',
  onPrimaryContainer: '#0b44ac',
  secondaryContainer: '#e7effc', // selected chips and segmented buttons
  onSecondaryContainer: '#0b44ac',
  background: '#f8f9f9',
  onBackground: '#2c2e34',
  surface: '#ffffff',
  onSurface: '#2c2e34',
  surfaceVariant: '#ededed',
  onSurfaceVariant: '#666c7a', // secondary text
  outline: '#838894',
  outlineVariant: '#dfe1e4',
  error: '#c03434',
  onError: '#ffffff',
  errorContainer: '#fbe9e9',
  onErrorContainer: '#852424',

  emergency: '#c03434', // red buttons and alert banners, always with white text
  success: '#0f796f',
  successContainer: '#f5fafa',
  emphasis: '#0b44ac', // dark blue banners with white text
};

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#acc7fa', // OUI blue 200
  onPrimary: '#072a69',
  primaryContainer: '#0b44ac',
  onPrimaryContainer: '#e7effc',
  secondaryContainer: '#0b44ac',
  onSecondaryContainer: '#e7effc',
  background: '#2c2e34',
  onBackground: '#f8f9f9',
  surface: '#3a3e46',
  onSurface: '#f8f9f9',
  surfaceVariant: '#454953',
  onSurfaceVariant: '#bfc2c8',
  outline: '#a0a4ad',
  outlineVariant: '#505660',
  error: '#f4acac',
  onError: '#571717',
  errorContainer: '#571717',
  onErrorContainer: '#fbe9e9',
  emergency: '#c03434',
  success: '#98ccc7',
  successContainer: '#073430',
  emphasis: '#0b44ac',
};

// Material's sizes are small for an emergency app, so Default is 10% bigger.
export const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small', scale: 1 },
  { value: 'medium', label: 'Default', scale: 1.1 },
  { value: 'large', label: 'Large', scale: 1.3 },
];

function scaleFonts(fonts, scale) {
  const scaled = {};
  for (const [name, font] of Object.entries(fonts)) {
    scaled[name] = font.fontSize
      ? { ...font, fontSize: Math.round(font.fontSize * scale), lineHeight: Math.round(font.lineHeight * scale) }
      : font;
  }
  return scaled;
}

// Paper theme for 'light' or 'dark' at the chosen font size.
export function makeTheme(scheme, fontSize) {
  const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const scale = FONT_SIZE_OPTIONS.find((o) => o.value === fontSize)?.scale ?? 1.1;
  return {
    ...base,
    colors: scheme === 'dark' ? darkColors : lightColors,
    fonts: scaleFonts(base.fonts, scale),
  };
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 };

// Smallest comfortable tap target, in points.
export const TOUCH = 48;
