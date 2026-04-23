/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          container: "var(--color-primary-container)",
          on: "var(--color-primary-on)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          container: "var(--color-secondary-container)",
          on: "var(--color-secondary-on)",
        },
        tertiary: {
          DEFAULT: "var(--color-tertiary)",
          container: "var(--color-tertiary-container)",
          on: "var(--color-tertiary-on)",
        },
        neutral: {
          DEFAULT: "var(--color-neutral)",
          variant: "var(--color-neutral-variant)",
        },
        outline: {
          DEFAULT: "var(--color-outline)",
          variant: "var(--color-outline-variant)",
        },
        ai: {
          primary: "var(--color-ai-primary)",
          "gradient-start": "var(--color-ai-gradient-start)",
          "gradient-end": "var(--color-ai-gradient-end)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          container: "var(--color-surface-container)",
          "container-low": "var(--color-surface-container-low)",
          "container-lowest": "var(--color-surface-container-lowest)",
          "container-high": "var(--color-surface-container-high)",
          lowest: "var(--color-surface-container-lowest)",
          low: "var(--color-surface-container-low)",
          high: "var(--color-surface-container-high)",
          on: "var(--color-surface-on)",
          "on-variant": "var(--color-surface-on-variant)",
        },
      },
      fontFamily: {
        manrope: ["Manrope_600SemiBold", "Manrope_700Bold", "Manrope_800ExtraBold"],
        inter: ["Inter_400Regular", "Inter_500Medium", "Inter_600SemiBold", "Inter_700Bold"],
        sans: ["Inter_400Regular"],
        headline: ["Manrope_700Bold"],
      },
      borderRadius: {
        atelier: "24px",
        "atelier-sm": "16px",
        "atelier-xs": "12px",
        "atelier-lg": "32px",
      },
      spacing: {
        "atelier-xs": "4px",
        "atelier-sm": "8px",
        "atelier-md": "16px",
        "atelier-lg": "24px",
        "atelier-xl": "32px",
        "atelier-2xl": "48px",
      },
      boxShadow: {
        "atelier-low": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "atelier-medium": "0 4px 16px rgba(0, 0, 0, 0.10)",
        "atelier-high": "0 8px 32px rgba(0, 0, 0, 0.16)",
      },
    },
  },
  plugins: [],
};
