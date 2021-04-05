import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ru from './ru.js';
import en from './en.js';
import de from './de.js';

const languages = ['en', 'de', 'ru'];

const i18n = () => i18next
  .use(LanguageDetector)
  .init({
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      caches: ['localStorage', 'cookie'],
      excludeCacheFor: ['cimode'],
    },
    fallbackLng: languages,
    debug: true,
    resources: {
      ru,
      en,
      de,
    },
  }, (err, t) => {
    t('languageError');
  });

export { i18n, languages };