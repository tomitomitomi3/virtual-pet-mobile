/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf6ee',
          100: '#f9e8d0',
          200: '#f3ce9e',
          300: '#ecae65',
          400: '#e68e35',
          500: '#d97519', // Principal
          600: '#c05d12',
          700: '#9e4412',
          800: '#7f3716',
          900: '#682e15',
        },
        surface: {
          50:  '#fafaf8', // Fondo
          100: '#f4f3ef',
          200: '#e8e6df',
          300: '#d6d3c8',
        }
      },
    },
  },
  plugins: [],
}
