/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff00ff',
          blue: '#00e5ff',
          green: '#39ff14',
          purple: '#8a2be2',
          yellow: '#f7ff00'
        },
        glass: {
          light: 'rgba(255,255,255,0.3)',
          dark: 'rgba(0,0,0,0.35)'
        }
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 38, 135, 0.37)',
        neon: '0 0 20px rgba(0, 229, 255, 0.6)'
      },
      backdropBlur: {
        xs: '2px'
      },
      animation: {
        glow: 'glow 2.2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 8px rgba(0,229,255,0.5)' },
          '100%': { textShadow: '0 0 18px rgba(255,0,255,0.9)' }
        }
      }
    }
  },
  plugins: []
};
