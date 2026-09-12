"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { SupportedLanguage } from "@/lib/i18n/translations";

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="inline-flex items-center gap-1.5 border border-subtle bg-background rounded px-2 py-1 focus-within:ring-1 focus-within:ring-accent text-xs">
      <Globe className="w-3.5 h-3.5 text-secondary flex-shrink-0" aria-hidden="true" />
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        aria-label={t.nav.selectLanguage}
        className="bg-transparent text-primary text-xs font-medium focus:outline-none cursor-pointer pr-1"
      >
        <option value="en" className="bg-surface text-primary">English</option>
        <option value="hi" className="bg-surface text-primary">हिन्दी</option>
        <option value="mr" className="bg-surface text-primary">मराठी</option>
      </select>
    </div>
  );
}
