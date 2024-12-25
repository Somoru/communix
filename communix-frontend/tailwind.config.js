/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all your template files
  ],
  theme: {
    extend: {
      colors: {
        'communix-teal': '#008080', // Define your teal color
        'communix-orange': '#FFA500', // Define your orange color
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Use Inter as the default sans-serif font
      },
    },
  },
  plugins: [],
}