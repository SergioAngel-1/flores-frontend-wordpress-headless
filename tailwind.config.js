/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primario: '#B91E59',
        secundario: '#EBC7E1',
        acento: '#8FD8B9',
        oscuro: '#6A0F49',
        claro: '#F5E6E8',
        texto: '#3A2A2F',
        hover: '#8A1443',
        border: '#D8A8C8',
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
