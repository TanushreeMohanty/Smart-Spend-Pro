/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Optional: Looks better with Inter
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // This is required for your animations
  ],
}