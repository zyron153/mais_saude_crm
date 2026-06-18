/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#EEF9F9",
          100: "#D6F5F5",
          200: "#A5EDED",
          300: "#67DADA",
          400: "#2CC4C4",
          500: "#13A3A3",
          600: "#0F9191",
          700: "#0D8080",
          800: "#0A6E6E",
          900: "#064E4E",
          950: "#032929",
        },
      },
      fontFamily: {
        sans:    ['"Work Sans"', "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        mono:    ['"IBM Plex Mono"', '"Cascadia Code"', "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
