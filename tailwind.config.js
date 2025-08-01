/** @type {import('tailwindcss').Config} */
const config = {
    theme: {
      extend: {
        fontFamily: {
          figtree: ['var(--font-figtree)', 'sans-serif'],
          inter: ['var(--font-inter)', 'sans-serif'],
        },
        colors: {
          primary: '#47317c',
          secondary: '#F7931E',
        },
      },
    },
    plugins: [],
  };
  
  export default config;
  