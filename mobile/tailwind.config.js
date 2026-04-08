/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#005ab4",
          container: "#0873df",
          on: "#ffffff",
        },
        secondary: {
          DEFAULT: "#465f89",
          container: "#b7cfff",
          on: "#ffffff",
        },
        tertiary: {
          DEFAULT: "#964400",
          container: "#bd5700",
          on: "#ffffff",
        },
        neutral: {
          DEFAULT: "#717785",
          variant: "#414753",
        },
        surface: {
          DEFAULT: "#f9f9ff",
          container: "#ecedf7",
          "container-low": "#f2f3fd",
          "container-lowest": "#ffffff",
          on: "#181c22",
          "on-variant": "#414753",
        },
        error: {
          DEFAULT: "#ba1a1a",
          on: "#ffffff",
        },
        outline: {
          DEFAULT: "#717785",
          variant: "#c1c6d5",
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
