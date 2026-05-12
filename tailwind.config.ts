import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0A0A0F",
          raised: "#0D0D14",
          card: "#101019",
        },
        accent: {
          50: "#F5F0FF",
          400: "#A855F7",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(168, 85, 247, 0.55)",
        "glow-lg": "0 0 80px -10px rgba(168, 85, 247, 0.6)",
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
        "radial-fade":
          "radial-gradient(60% 50% at 50% 0%, rgba(139,92,246,0.18) 0%, rgba(10,10,15,0) 70%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
