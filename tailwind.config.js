/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        barlow: ["Barlow", "sans-serif"],
        "barlow-condensed": ["Barlow Condensed", "sans-serif"],
      },
      colors: {
        brand: {
          orange: "#F97316",
          green: "#22C55E",
        },
      },
    },
  },
  plugins: [],
};
