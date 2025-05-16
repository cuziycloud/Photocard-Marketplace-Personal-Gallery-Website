/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  darkMode: 'class',
  theme: {
    extend: {},
    animation: {
      modalBgShow: 'modalBgShow 0.001s ease-out forwards',
      modalContentShow: 'modalContentShow 0.001s 0.001s ease-out forwards'
    }
  },
  
  plugins: [],
}