import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#17312E",
          soft: "#4F6663",
          faint: "#7C8F8C",
        },
        jade: {
          50: "#F2F8F5",
          100: "#E2F0E9",
          200: "#C7E4D7",
          300: "#A5D4C2",
          400: "#7CBEA8",
          500: "#56A38D",
          600: "#3D8874",
          700: "#2F6E5E",
          800: "#27584C",
          900: "#1F463D",
        },
        bubble: {
          user: "#BFE8CD",
          ai: "#FFFFFF",
        },
        canvas: "#EDEFF0",
        paper: "#FBFAF7",
        crisis: "#B4443C",
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        bubble: "0 1px 2px rgba(23, 49, 46, 0.06)",
        card: "0 10px 30px rgba(23, 49, 46, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dot-bounce": {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.45" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "dot-bounce": "dot-bounce 1.2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
