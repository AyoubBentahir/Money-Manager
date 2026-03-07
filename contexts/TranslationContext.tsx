import { createContext, useContext } from 'react';
import { Language } from '../types';

export interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, placeholders?: Record<string, any>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslations = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context;
};

// We export the context itself to be used in App.tsx for the Provider
export default TranslationContext;
