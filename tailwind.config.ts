import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      colors: {
        gold: { DEFAULT: '#C19A6B', dark: '#A8814F', light: '#E8C99A' },
      },
      borderRadius: {
        xl: '16px', '2xl': '20px', '3xl': '28px',
      },
    },
  },
  plugins: [],
};
export default config;
