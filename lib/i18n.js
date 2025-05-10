import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';

i18n
  .use(HttpApi)                         // Loads translations via HTTP
  .use(LanguageDetector)               // Detects browser/localStorage language
  .use(initReactI18next)               // Passes i18n instance to react-i18next
  .init({
    fallbackLng: 'en',                 // Default to English if no translation found
    supportedLngs: ['en', 'fr', 'ja', 'es', 'de'],       // Supported languages

    detection: {
      order: ['localStorage', 'navigator'], // Language detection order
      caches: ['localStorage'],             // Cache detected language
    },

    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Path to translation files
    },

    react: {
      useSuspense: false,              // Disable suspense for SSR compatibility
    },

    saveMissing: true,                // Optional: enables auto-translation of missing keys

    missingKeyHandler: async (lng, ns, key) => {
      if (lng === 'en') return;

      
    },

    debug: false, // Set to true to log loading/missing keys
  });

export default i18n;
