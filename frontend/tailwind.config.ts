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
        "primary-fixed": "#eef0d5",
        "primary-fixed-dim": "#d2d4ba",
        "primary-container": "#f0f1e8",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#212210",
        "on-primary-fixed-variant": "#4f5035",
        "on-primary-container": "#1d1e11",

        secondary: "#5d5f50",
        "secondary-fixed": "#e2e4d2",
        "secondary-fixed-dim": "#c6c8b7",
        "secondary-container": "#e2e4d2",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#1a1c14",
        "on-secondary-fixed-variant": "#454739",
        "on-secondary-container": "#1a1c14",

        tertiary: "#3e6368",
        "tertiary-fixed": "#c1e9ee",
        "tertiary-fixed-dim": "#a5ccd1",
        "tertiary-container": "#c1e9ee",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#001f23",
        "on-tertiary-fixed-variant": "#254b50",
        "on-tertiary-container": "#001f23",

        error: "#b91c1c",
        "error-container": "#fee2e2",
        "on-error": "#ffffff",
        "on-error-container": "#450a0a",

        background: "#f6f7f8",
        "on-background": "#0f172a",

        surface: "#ffffff",
        "surface-dim": "#f6f7f8",
        "surface-bright": "#ffffff",
        "surface-variant": "#f1f5f9",
        "surface-tint": "#6A6B4C",
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        "inverse-surface": "#1e293b",
        "inverse-on-surface": "#f8fafc",
        "inverse-primary": "#d4d5b2",

        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8f9fa",
        "surface-container": "#f1f3f4",
        "surface-container-high": "#e8eaed",
        "surface-container-highest": "#dee1e6",

        outline: "#cbd5e1",
        "outline-variant": "#e2e8f0",

        "background-light": "#f8f9f5",
        "background-dark": "#1a1b14",
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