import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d8",
          300: "#f4a8b8",
          400: "#ec7592",
          500: "#e04470",
          600: "#cc2257",
          700: "#a91847",
          800: "#7a2d45",
          900: "#5c1a2e",
          950: "#3a101d",
        },
        cream: {
          DEFAULT: "#faf6ef",
          50:  "#fefdfb",
          100: "#faf6ef",
          200: "#f5ede0",
          300: "#ede4d3",
          400: "#e0d0b8",
          500: "#ccb99a",
        },
        gold: {
          DEFAULT: "#c9a227",
          50:  "#fdf9ec",
          100: "#f7eccb",
          200: "#eed897",
          300: "#e3c063",
          400: "#d9a83e",
          500: "#c9a227",
          600: "#a67c1a",
          700: "#7d5b18",
          800: "#5a4019",
          900: "#3d2c14",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "Times New Roman", "serif"],
        body:    ["var(--font-source-sans)", "system-ui", "sans-serif"],
        hindi:   ["var(--font-noto-devanagari)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:   "0 8px 28px rgba(58, 16, 29, 0.10)",
        "card-hover": "0 20px 48px rgba(58, 16, 29, 0.18)",
        gold:   "0 4px 16px rgba(201, 162, 39, 0.40)",
        "gold-hover": "0 6px 24px rgba(201, 162, 39, 0.55)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, rgba(26,8,16,0.96) 0%, rgba(92,26,46,0.82) 50%, rgba(122,45,69,0.65) 100%)",
        "gold-gradient": "linear-gradient(135deg, #c9a227 0%, #a67c1a 100%)",
        "maroon-gradient": "linear-gradient(135deg, #3a101d 0%, #5c1a2e 100%)",
        "cream-gradient": "linear-gradient(180deg, #ede4d3 0%, #faf6ef 100%)",
      },
      animation: {
        marquee:    "marquee 30s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "float-in": "float-in 0.6s ease 1s both",
        "fade-up":  "fade-up 0.5s ease forwards",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.5", transform: "scale(1.4)" },
        },
        "float-in": {
          from: { opacity: "0", transform: "scale(0.5) translateY(20px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
