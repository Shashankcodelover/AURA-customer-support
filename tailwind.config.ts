import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1120',
          900: '#0F172A',
          800: '#141E33',
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
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(62,198,255,0.12)' },
          '50%': { boxShadow: '0 0 32px rgba(139,92,246,0.30)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        glow: 'glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
