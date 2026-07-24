/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      colors: { navy: "#0b1835" },
      boxShadow: { card: "0 8px 30px rgba(15, 23, 42, 0.06)" },
    },
  },
  plugins: [],
};
