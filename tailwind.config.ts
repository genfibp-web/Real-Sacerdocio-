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
        'real-black': '#050505',
        'real-dark': '#121212',
        'real-purple': '#4c1d95',
        'real-blue': '#1e3a8a',
        'real-gold': '#d4af37',
      },
      fontFamily: {
        serif: ['var(--font-cinzel)'],
        sans: ['var(--font-inter)'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.9) 100%)',
      }
    },
  },
  plugins: [],
};
export default config;