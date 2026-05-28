<<<<<<< HEAD
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(0,0,0,.08)",
        card: "0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)",
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};
=======
export default { content: ['./index.html','./src/**/*.{ts,tsx}'], theme: { extend: { boxShadow: { soft: '0 24px 70px rgba(15,23,42,.08)' } } }, plugins: [] }
>>>>>>> fe0a7ba (Improve booking and payment workflow UI)
