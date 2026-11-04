/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // Etapa 8 • projetores/telas baixas (ex.: 800×600, 1024×768): compacta a composição
        short: { raw: '(max-height: 780px)' },
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans JP"', 'sans-serif'],
        jp: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Etapa 8 • tipografia editorial para títulos e números de impacto
        display: ['"Noto Serif JP"', '"Times New Roman"', 'serif'],
      },
      colors: {
        // Etapa 8 • paleta "apresentação corporativa japonesa"
        sumi: { DEFAULT: '#0B0B0D', 900: '#08080A', 800: '#111114', 700: '#18181C' }, // preto profundo / grafite
        washi: { DEFAULT: '#F2EEE6', muted: '#B9B3A8', dim: '#7E7A73' }, // branco papel para leitura
        beni: { DEFAULT: '#D7263D', soft: '#EC4A5C', deep: '#9E1426' }, // vermelho japonês (assinatura)
        kin: { DEFAULT: '#C9A45C', soft: '#E0C58A' }, // dourado complementar
        ai: { DEFAULT: '#4C6FA5', soft: '#86A3CF' }, // azul índigo complementar
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
