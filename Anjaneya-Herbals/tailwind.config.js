/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#D6AD60', // Antique Gold
        'brand-orange': '#C05621', // Terracotta
        'brand-green': '#1E3A2F', // Deep Forest Green
        'brand-black': '#122620', // Deep Green/Black
        'brand-gray': '#D4D4D8', // Zinc 300
        'brand-cream': '#F2F0E9', // Parchment / Alabaster
        'brand-sand': '#E6E2D6', // Deep Sand
        'brand-sage': '#9CAF88', // Muted Sage
        'brand-terracotta': '#C05621', // Terracotta
        'brand-moss': '#1E3A2F', // Deep Forest Green
        'brand-earth': '#3E2723', // Dark Earth
        // Keeping standard palette for utilities if needed
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}