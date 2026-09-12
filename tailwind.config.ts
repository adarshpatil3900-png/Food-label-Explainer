import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background, #FAFAF9)",
        surface: "var(--color-surface, #FFFFFF)",
        primary: "var(--color-primary, #1A1A1A)",
        secondary: "var(--color-secondary, #6B7280)",
        subtle: "var(--color-subtle, #E5E7EB)",
        accent: {
          DEFAULT: "var(--color-accent, #3F6B4A)",
          hover: "var(--color-accent-hover, #34593E)",
          active: "var(--color-accent-active, #2B4A34)",
          light: "var(--color-accent-light, #EDF3EE)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "6px",
      },
    },
  },
  plugins: [],
};
export default config;
