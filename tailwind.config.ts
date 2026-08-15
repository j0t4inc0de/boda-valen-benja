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
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          light: "#dcc29f",
          DEFAULT: "#c5a880",
          dark: "#a3865c",
        },
        olive: {
          light: "#425a4d",
          DEFAULT: "#2d3e35",
          dark: "#1b2621",
        },
        cream: {
          light: "#fffefc",
          DEFAULT: "#fdfbf7",
          dark: "#f4f0e6",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
