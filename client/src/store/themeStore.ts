import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      
      toggleDarkMode: () => {
        const newMode = !get().isDarkMode;
        set({ isDarkMode: newMode });
        updateHTMLClass(newMode);
      },
      
      setDarkMode: (isDark: boolean) => {
        set({ isDarkMode: isDark });
        updateHTMLClass(isDark);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateHTMLClass(state.isDarkMode);
        }
      },
    }
  )
);

function updateHTMLClass(isDark: boolean) {
  if (typeof window !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      updateHTMLClass(parsed.state?.isDarkMode || false);
    } catch (e) {
      // If parsing fails, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      updateHTMLClass(prefersDark);
      useThemeStore.getState().setDarkMode(prefersDark);
    }
  } else {
    // No stored preference, use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    updateHTMLClass(prefersDark);
    useThemeStore.getState().setDarkMode(prefersDark);
  }
}