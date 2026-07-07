/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Rajdhani", "Inter", "system-ui", "sans-serif"],
      },

      colors: {
        primary: {
          50: "#E8FFF9",
          100: "#CFFEF2",
          200: "#A5F9E2",
          300: "#7EE6C8",
          400: "#4DD5B0",
          500: "#0F6B63",
          600: "#0C5953",
          700: "#094843",
          800: "#073734",
          900: "#052827",
        },

        brand: "#0F6B63",

        background: {
          DEFAULT: "var(--color-bg)",
          secondary: "var(--color-bg-secondary)",
        },

        surface: {
          DEFAULT: "var(--color-surface)",
          hover: "var(--color-surface-hover)",
          elevated: "var(--color-surface-elevated)",
        },

        border: {
          DEFAULT: "var(--color-border)",
          soft: "var(--color-border-soft)",
        },

        text: {
          primary: "var(--color-text)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          accent: "var(--color-text-accent)",
        },

        success: "#31C48D",
        warning: "#FACC15",
        danger: "#EF4444",
      },

      boxShadow: {
        glow: "0 0 20px rgba(126,230,200,0.20)",
        card: "0 8px 30px rgba(0,0,0,0.35)",
      },

      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },

      backgroundImage: {
        heroGradient:
          "linear-gradient(135deg,#050707 0%,#0B0F0F 45%,#0F6B63 100%)",
        cardGradient:
          "linear-gradient(180deg,#121818 0%,#0B0F0F 100%)",
      },
    },
  },

  plugins: [],
};
