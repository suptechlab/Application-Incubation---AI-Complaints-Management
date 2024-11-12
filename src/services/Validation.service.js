// getValidationMessages.js
import { messages } from '../language/validationLocalization';

export const getValidationMessages = (lang = 'es') => {
  return messages[lang] || messages.es; // Fallback to English if the language is not found
};



// function translateText(arabicText, spanishText) {
//   const cookies = new Cookies()
//   const userLanguage = cookies.get('userLangKey') ?? 'en';
//       return userLanguage === 'es' ? spanishText : englishText;
//   }