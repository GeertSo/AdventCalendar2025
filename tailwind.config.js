/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./python_upload/*.csv",  // auch in der Datenbank / csv-Dateiinput wird css-code genutzt
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
