import { createContext, useContext, useState, useCallback } from 'react';
import translations from './translations';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nagarvoice_lang') || 'en';
  });

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    return value || key;
  }, [language]);

  const switchLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('nagarvoice_lang', lang);
  }, []);

  return (
    <I18nContext.Provider value={{ language, t, switchLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

export default I18nContext;
