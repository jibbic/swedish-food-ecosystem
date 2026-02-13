import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        myndighet: {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1e40af',
        },
        uppgiftskrav: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#ea580c',
        },
        verksamhet: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        risk: {
          1: '#10b981',
          2: '#84cc16',
          3: '#eab308',
          4: '#f97316',
          5: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}

export default config
