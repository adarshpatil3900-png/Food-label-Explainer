"use client";

import React from "react";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="w-full border-b border-subtle bg-surface px-4 sm:px-6 py-3.5 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <h1 className="text-base font-semibold tracking-tight text-primary">
          {t.nav.title}
        </h1>

        <div className="flex items-center gap-2.5">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
