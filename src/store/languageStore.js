import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();

  if (langCode === 'tk') return 'tm';
  if (['en', 'ru', 'tm'].includes(langCode)) return langCode;

  return 'en';
};

export const useLanguageStore = create(
  devtools(
    persist(
      (set) => ({
        language: detectBrowserLanguage(),

        setLanguage: (newLanguage) => {
          set({ language: newLanguage });
        },

        resetLanguage: () => {
          set({ language: detectBrowserLanguage() });
        },
      }),
      {
        name: 'language-store',
        getStorage: () => localStorage,
      }
    )
  )
);
