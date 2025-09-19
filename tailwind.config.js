/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Saffron/Orange theme for Jain community
        saffron: {
          50: '#FFF8F0',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6B35', // Primary saffron
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Cream/Off-white backgrounds
        cream: {
          50: '#FEFDFB',
          100: '#FDF8F0',
          200: '#FCF1E4',
          300: '#F9E8D3',
          400: '#F5DCC2',
          500: '#F0D0B1',
          600: '#E8C4A0',
          700: '#DFB68F',
          800: '#D1A87D',
          900: '#C2976B',
        },
        // Deep maroon for text and accents
        maroon: {
          50: '#FDF2F2',
          100: '#FCE7E7',
          200: '#FECACA',
          300: '#FDA4A4',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#8B0000', // Deep maroon
          900: '#7F1D1D',
        },
        // Gold accents
        gold: {
          50: '#FFFDF7',
          100: '#FFFAEB',
          200: '#FEF3C7',
          300: '#FDE68A',
          400: '#FCD34D',
          500: '#FFD700', // Pure gold
          600: '#F59E0B',
          700: '#D97706',
          800: '#B45309',
          900: '#92400E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
          '40%, 43%': { transform: 'translateY(-5px)' },
          '70%': { transform: 'translateY(-3px)' },
          '90%': { transform: 'translateY(-2px)' },
        },
      },
    },
  },
  plugins: [],
};