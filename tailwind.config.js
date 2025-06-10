/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-dark': '#4338CA',
        secondary: '#10B981',
        accent: '#F59E0B',
      },
    },
  },
  plugins: [],
}

