// src/i18n.js (no changes)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

const resources = {
  en: { translation: translations.en },
  ru: { translation: translations.ru },
  tm: { translation: translations.tm },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;