import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        prism: {
          canvas: '#F6F6FB',
          text: '#1B1D2A',
          muted: '#6B6E85',
          footnote: '#9599AD',
        },
        mint: {
          DEFAULT: '#0E9C74',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          400: '#34D399',
          500: '#0E9C74',
          600: '#059669',
        },
        'violet-accent': {
          DEFAULT: '#6D4AEB',
          50: '#EDE9FE',
          100: '#DDD6FE',
          200: '#C4B5FD',
          400: '#A78BFA',
          500: '#6D4AEB',
          600: '#5B21B6',
        },
        'amber-accent': {
          DEFAULT: '#C97A00',
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#C97A00',
        },
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
