import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: "#6A6B4C",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        "surface-dim": "#f6f7f8",
        "surface-container-low": "#f8f9fa",
        "surface-container-high": "#e8eaed",
        "primary-container": "#f0f1e8",
        "wa-bg-main": "#0b141a",
        "wa-bg-sidebar": "#111b21",
        "wa-bg-search": "#202c33",
        "wa-bg-active": "#2a3942",
        "wa-bubble-sent": "#005c4b",
        "wa-bubble-received": "#202c33",
        "wa-text-primary": "#e9edef",
        "wa-text-secondary": "#8696a0",
        "wa-check-blue": "#53bdeb",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;