/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'sans-serif'], // Добавляем шрифт Railway
      },
      colors: {
        darkBlue: '#021521',
        customYellow: '#F5C638',
      },
    },
  },
  plugins: [],
}

