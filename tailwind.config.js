/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bai: ['Bai Jamjuree', 'sans-serif'],
      },
      colors: {
        pastelGreen: "#EB4463", //74dc9c
        textGreen: "#EB4463", //rgb(73, 169, 73)
        dmGreen: "#D8E9E9" //#EAF6F6
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
