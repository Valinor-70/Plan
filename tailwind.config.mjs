/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          tertiary: '#06b6d4',
        },
        // Semantic Colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        // Neutral Palette - Light
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        },
        background: {
          light: '#fafafa',
          dark: '#0f172a',
        },
        border: {
          light: '#e5e7eb',
          dark: '#334155',
        },
        text: {
          primary: {
            light: '#0f172a',
            dark: '#f1f5f9',
          },
          secondary: '#64748b',
          tertiary: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['48px', '56px'],
        'h1': ['36px', '44px'],
        'h2': ['30px', '36px'],
        'h3': ['24px', '32px'],
        'h4': ['20px', '28px'],
        'body-lg': ['18px', '28px'],
        'body': ['16px', '24px'],
        'body-sm': ['14px', '20px'],
        'caption': ['12px', '16px'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-up': 'slideInUp 300ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      transitionTimingFunction: {
        'bounce-sm': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
