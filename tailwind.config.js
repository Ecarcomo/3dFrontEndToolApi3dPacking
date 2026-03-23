/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        crm: "0 1px 2px rgb(0 0 0 / 0.35), 0 8px 24px -6px rgb(0 0 0 / 0.45)",
      },
    },
  },
  plugins: [],
};
