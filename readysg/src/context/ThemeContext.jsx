// Saves the dark mode and font size settings and passes the theme to Paper.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { makeTheme } from '../theme';
import { loadJSON, saveJSON, keys } from '../lib/storage';

export const THEME_MODE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const SettingsContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('system');
  const [fontSize, setFontSizeState] = useState('medium');

  // Load saved settings on startup.
  useEffect(() => {
    loadJSON(keys.themeMode, 'system').then(setThemeModeState);
    loadJSON(keys.fontSize, 'medium').then(setFontSizeState);
  }, []);

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    saveJSON(keys.themeMode, mode);
  };

  const setFontSize = (size) => {
    setFontSizeState(size);
    saveJSON(keys.fontSize, size);
  };

  const scheme = themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;
  const theme = useMemo(() => makeTheme(scheme, fontSize), [scheme, fontSize]);

  return (
    <SettingsContext.Provider value={{ scheme, themeMode, setThemeMode, fontSize, setFontSize }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </SettingsContext.Provider>
  );
}

// For the settings only. Colours come from Paper's useTheme().
export const useThemeSettings = () => useContext(SettingsContext);
