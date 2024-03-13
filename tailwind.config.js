/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pastelGreen: "#74dc9c",
        textGreen: "rgb(73, 169, 73)"
      },
      padding: {
        22: "5.5rem",
        rPostCustom: "2rem",
        lPostCustom: "19.5rem",
        rSearchPadding: "20.5rem"
      },
      fontSize: {
        invisible: "0.00001px",
        logoSize: "2.4rem"
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
