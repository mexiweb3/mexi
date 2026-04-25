import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7e6",
          100: "#ffe9b8",
          200: "#ffd87a",
          300: "#ffc54a",
          400: "#ffb01f",
          500: "#f59300",
          600: "#cc7600",
          700: "#995800",
          800: "#663b00",
          900: "#331e00",
        },
        sky: {
          accent: "#5ac8fa",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        wiggle: "wiggle 600ms ease-in-out infinite",
        bounceSoft: "bounceSoft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
