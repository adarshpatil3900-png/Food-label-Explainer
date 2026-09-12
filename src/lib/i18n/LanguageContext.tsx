"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SupportedLanguage, TranslationDictionary, translations } from "./translations";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  tTag: (label: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("food_label_language") as SupportedLanguage | null;
    if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("food_label_language", lang);
  };

  const currentTranslations = translations[language] || translations.en;

  const tTag = (label: string): string => {
    return currentTranslations.tagLabels[label] || label;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: currentTranslations,
        tTag,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: "en" as SupportedLanguage,
      setLanguage: () => {},
      t: translations.en,
      tTag: (l: string) => l,
    };
  }
  return context;
}
