import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const detectSystemTheme = () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const useThemeStore = create(
  devtools(
    persist(
      (set) => ({
        theme: detectSystemTheme(),
        accentColor: 'mostly',

        setTheme: (newTheme) => {
          set({ theme: newTheme });
        },

        setAccentColor: (newAccentColor) => {
          set({ accentColor: newAccentColor });
        },

        resetTheme: () => {
          set({ theme: detectSystemTheme() });
        },
      }),
      {
        name: 'theme-store',
        getStorage: () => localStorage,
      }
    )
  )
);
