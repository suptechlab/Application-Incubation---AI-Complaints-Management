// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { spanishLang } from './spanish';
import { englishLang } from './english';

import { getLocalStorage } from '../utils/storage';



// const userLanguage = getLocalStorage('lang')  ? getLocalStorage('lang') : 'es';

const userLanguage = "es";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    lng: userLanguage ?? 'es', // set the default language
    resources: {
      // TRANSLATIONS
      en: {
        translation: englishLang
      },
      es : {
        translation : spanishLang
      }
      // add more languages as needed
    },
    fallbackLng: 'es', // use the default language if translation is missing
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
  });

export default i18n;