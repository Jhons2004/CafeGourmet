/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  corePlugins: {
    preflight: false, // let Bootstrap handle base styles
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
