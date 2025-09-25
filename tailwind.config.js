// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F2F2F7',
          dark: '#1C1C1E',
          'card-light': '#FFFFFF',
          'card-dark': '#2C2C2E',
        },
        text: {
          light: '#000000',
          dark: '#FFFFFF',
          'secondary-light': '#3A3A3C',
          'secondary-dark': '#EBEBF5',
          'disabled-light': '#8E8E93',
          'disabled-dark': '#636366',
        },
        accent: {
          blue: '#0A84FF',
          green: '#30D158',
          red: '#FF453A',
          orange: '#FF9F0A',
        },
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
