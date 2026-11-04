/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
        jp: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        kizuna: {
          navy: '#0B1120',
          slate: '#1E293B',
          indigo: '#1E3A8A',
          accent: '#2563EB',
        }
      }
    },
  },
  plugins: [],
}
