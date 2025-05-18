/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  darkMode: 'class',
  theme: {
    extend: {},
    animation: {
      modalBgShow: 'modalBgShow 0.1s ease-out forwards',
      modalContentShow: 'modalContentShow 0.1s 0.2s ease-out forwards'
    }
  },
  
  plugins: [],
}