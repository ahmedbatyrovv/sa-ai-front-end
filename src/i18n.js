import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';
import { useLanguageStore } from './store/languageStore';

const resources = {
  en: { translation: translations.en },
  ru: { translation: translations.ru },
  tm: { translation: translations.tm },
};

const initialLanguage = useLanguageStore.getState().language;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;