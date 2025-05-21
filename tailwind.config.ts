import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1873BF',   
        "custom-light-blue": "#72aede",
        "primary-opacity": 'rgba(0, 123, 255, 0.5)', 
        secondary: '#FDA821', 
        "custom-white": "#F5F5F5",
        "custom-gray": "#637074",
        'custom-gray-light':  '#dee0e0',
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
