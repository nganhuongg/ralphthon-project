import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'verse-red': '#8B1A1A',
        'verse-red-dark': '#5C0E0E',
        'verse-red-light': '#B52929',
        'verse-gold': '#C9A84C',
        'verse-gold-light': '#E8C96A',
        'verse-gold-dim': '#8B7233',
        'verse-black': '#1A0A00',
        'verse-paper': '#F5ECD7',
        'verse-paper-dark': '#E8D9BC',
        'verse-ash': '#6B6B6B',
        'verse-ash-light': '#9B9B9B',
      },
      fontFamily: {
        'verse': ['var(--font-be-vietnam-pro)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
