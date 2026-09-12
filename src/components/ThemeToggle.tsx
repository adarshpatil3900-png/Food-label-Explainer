"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("food_label_theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("food_label_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className="p-1.5 text-secondary hover:text-primary bg-background hover:bg-subtle border border-subtle rounded transition-colors inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
    >
      {mounted && theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-secondary" strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}
