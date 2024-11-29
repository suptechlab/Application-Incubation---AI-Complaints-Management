// getValidationMessages.js
import { messages } from '../lang/validationLocalization';

export const getValidationMessages = (lang = 'es') => {
  return messages[lang] || messages.es; // Fallback to English if the language is not found
};


