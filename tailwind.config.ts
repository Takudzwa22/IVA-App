import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./screens/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./constants.tsx",
    "./App.tsx"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3E64FF",
        secondary: "#A770EF",
        accent: "#F7B733",
        "brand-blue": "#001f54",
        "brand-purple": "#6f42c1",
        background: "#F9FAFB"
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "Inter", "Helvetica Neue", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Inter", "Helvetica Neue", "sans-serif"]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem"
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.04)",
        card: "0 4px 12px rgba(0,0,0,0.06)",
        // Keeping glass for backward compat but making it cleaner
        glass: "0 4px 12px rgba(0,0,0,0.06)"
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(-10%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)"
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)"
          }
        }
      },
      animation: {
        "bounce-slow": "bounce-slow 2s infinite"
      }
    }
  },
  plugins: []
};

export default config;
