import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kbc: {
          green: "#009C3A",
          "green-dark": "#007A2E",
          "green-light": "#E8F7EE",
          "green-mid": "#33B05F",
          ink: "#0B1F14",
          slate: "#3D4F44",
          mist: "#F3F7F4",
          sand: "#E8EDE9",
          alert: "#C45C26",
          "alert-soft": "#FDF0E8",
          info: "#1A6B8A",
          "info-soft": "#E6F3F8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(11, 31, 20, 0.08)",
        panel: "0 12px 40px rgba(11, 31, 20, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "banner-in": {
          "0%": { opacity: "0", transform: "translateY(-8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "banner-in": "banner-in 0.45s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
