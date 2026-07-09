import { useState, useEffect } from 'react';

const MOCK_THEME_PREFERENCES = {
  theme: 'system',
  compactMode: false,
  reducedMotion: false,
  language: 'English'
};

export const useThemeSettings = () => {
  const [themePrefs, setThemePrefs] = useState(MOCK_THEME_PREFERENCES);
  const [saving, setSaving] = useState(false);

  // Example of reacting to system theme change if 'system' is selected
  useEffect(() => {
    if (themePrefs.theme === 'system') {
      const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
      const updateSystemTheme = (e) => {
        // Here you would dynamically apply dark/light classes to the body/html
      };
      matchMedia.addEventListener('change', updateSystemTheme);
      return () => matchMedia.removeEventListener('change', updateSystemTheme);
    }
  }, [themePrefs.theme]);

  const updatePreference = (field, value) => {
    setThemePrefs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
  };

  return {
    themePrefs,
    saving,
    updatePreference,
    savePreferences
  };
};
