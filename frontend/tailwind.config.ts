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
        brand: {
          900: '#0a0f1e',
          800: '#111827',
          700: '#1f2937',
          400: '#6b7280',
          100: '#f9fafb',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
        tier: {
          elite: '#f59e0b',
          starter: '#10b981',
          role: '#6b7280',
          bust: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
