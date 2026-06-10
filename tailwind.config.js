/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#08080a',
          raised: '#0f0f12',
          overlay: '#16161a',
          glass: 'rgba(255, 255, 255, 0.03)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          muted: 'rgba(255, 255, 255, 0.04)',
          focus: 'rgba(255, 255, 255, 0.16)',
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#52525b',
        },
        accent: {
          DEFAULT: '#e4e4e7',
          hover: '#fafafa',
          muted: '#3f3f46',
          subtle: 'rgba(228, 228, 231, 0.08)',
        },
        success: '#86efac',
        warning: '#fcd34d',
        danger: '#fca5a5',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 255, 255, 0.03)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
