import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B3A6B",
          50: "#EBF0F7",
          100: "#D6E1EF",
          200: "#ADC3DF",
          300: "#84A5CF",
          400: "#5B87BF",
          500: "#1B3A6B",
          600: "#183460",
          700: "#142D55",
          800: "#11264A",
          900: "#0D1F3F",
        },
        accent: {
          DEFAULT: "#E8441A",
          50: "#FEF0EB",
          100: "#FDE1D7",
          200: "#FBC3AF",
          300: "#F9A587",
          400: "#F0724E",
          500: "#E8441A",
          600: "#D03D17",
          700: "#B83614",
          800: "#A02F11",
          900: "#88280E",
        },
        background: "#F8FAFC",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
