/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // ORPHI Brand Colors
        'cyber-blue': '#00D4FF',
        'royal-purple': '#7B2CBF',
        'energy-orange': '#FF6B35',
        'deep-space': '#1A1A2E',
        'midnight-blue': '#16213E',
        'silver-mist': '#B8C5D1',
        'success-green': '#00FF88',
        'alert-red': '#FF4757',
        'premium-gold': '#FFD700',
        'pure-white': '#FFFFFF',
        
        // Semantic Colors
        primary: {
          DEFAULT: '#00D4FF',
          50: '#E6F9FF',
          100: '#CCF3FF',
          200: '#99E7FF',
          300: '#66DBFF',
          400: '#33CFFF',
          500: '#00D4FF',
          600: '#00A3CC',
          700: '#007299',
          800: '#004166',
          900: '#001033',
          dark: '#0099CC'
        },
        secondary: {
          DEFAULT: '#7B2CBF',
          50: '#F3E8FF',
          100: '#E7D1FF',
          200: '#CFA3FF',
          300: '#B775FF',
          400: '#9F47FF',
          500: '#7B2CBF',
          600: '#6223A0',
          700: '#4A1A81',
          800: '#311162',
          900: '#190843'
        },
        accent: {
          DEFAULT: '#FF6B35',
          50: '#FFF2ED',
          100: '#FFE5DB',
          200: '#FFCBB7',
          300: '#FFB193',
          400: '#FF976F',
          500: '#FF6B35',
          600: '#FF4500',
          700: '#CC3700',
          800: '#992A00',
          900: '#661C00'
        },
        success: {
          DEFAULT: '#00FF88',
          50: '#E6FFEF',
          100: '#CCFFDF',
          200: '#99FFBF',
          300: '#66FF9F',
          400: '#33FF8F',
          500: '#00FF88',
          600: '#00CC6A',
          700: '#00994D',
          800: '#006633',
          900: '#003319'
        }
      },
      fontFamily: {
        primary: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
        secondary: ['JetBrains Mono', 'SF Mono', 'monospace'],
        display: ['Orbitron', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'pulse-cyber': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'cyber': '0 0 20px rgba(0, 212, 255, 0.3)',
        'purple': '0 0 20px rgba(123, 44, 191, 0.3)',
        'orange': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow': '0 0 20px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}

