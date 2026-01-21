import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foreground: 'var(--foreground)',
        background: 'var(--background)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          bg: 'var(--primary-bg)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: 'var(--accent)',
        error: {
          text: 'var(--error-text)',
          bg: 'var(--error-bg)',
          border: 'var(--error-border)',
          'bg-hover': 'var(--error-bg-hover)',
        },
        warning: {
          text: 'var(--warning-text)',
          'text-dark': 'var(--warning-text-dark)',
          bg: 'var(--warning-bg)',
        },
        success: {
          text: 'var(--success-text)',
          bg: 'var(--success-bg)',
        },
        info: {
          text: 'var(--info-text)',
          bg: 'var(--info-bg)',
        },
        neutral: {
          text: 'var(--neutral-text)',
          bg: 'var(--neutral-bg)',
        },
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-bg': 'var(--gradient-bg)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
