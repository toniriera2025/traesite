import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Detection options
const detectionOptions = {
  order: ['localStorage', 'htmlTag'],
  lookupLocalStorage: 'i18nextLng',
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,
  caches: ['localStorage'],
  excludeCacheFor: ['cimode'],
  checkWhitelist: true
};

i18n
  // Load translation using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Fallback language
    fallbackLng: 'ca',
    
    // Supported languages
    supportedLngs: ['en', 'es', 'ca'],
    
    // Language detection
    detection: detectionOptions,
    
    // Default namespace
    defaultNS: 'common',
    
    // Namespace separation
    ns: ['common', 'navigation', 'portfolio', 'contact', 'admin', 'seo'],
    
    // Debugging
    debug: process.env.NODE_ENV === 'development',
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
      formatSeparator: ','
    },
    
    // React options
    react: {
      useSuspense: false,
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em']
    },
    
    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      allowMultiLoading: false,
      crossDomain: false
    },
    
    // Optimization
    load: 'languageOnly',
    cleanCode: true,
    
    // Formatting
    returnObjects: false,
    joinArrays: ' ',
    
    // Missing keys
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${lng}.${ns}.${key}`);
      }
    }
  });

export default i18n;

// Helper functions
export const getCurrentLanguage = (): string => i18n.language || 'ca';

export const changeLanguage = (language: string): Promise<any> => {
  return i18n.changeLanguage(language);
};

export const getSupportedLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' }
];

export const isRTL = (language?: string): boolean => {
  const lang = language || getCurrentLanguage();
  return ['ar', 'he', 'fa', 'ur'].includes(lang);
};