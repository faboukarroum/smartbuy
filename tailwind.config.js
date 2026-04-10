/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B5CF6", // Purple for a modern feel
        secondary: "#10B981", // Emerald for accents
        vintage: {
          50: "#FDFCFB",
          100: "#F7F3F0",
          200: "#EFE6DF",
          300: "#E2D1C3",
          400: "#D4BBA6",
          500: "#C6A489",
          600: "#B38C6F",
          700: "#966E55",
          800: "#7A5641",
          900: "#5E4030",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
