import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",  // <--- THIS LINE IS CRITICAL
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0B3D2E", // Deep Forest Green
          gold: "#D4AF37",  // Luxury Gold
          light: "#F5F7F5", // Off-white background
          dark: "#052018",  // Dark text
        }
      },
    },
  },
  plugins: [],
};
export default config;