/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: '#f9fafb',
        accent: {
          DEFAULT: '#0ea5e9', // Electric Blue
          light: '#38bdf8',
          dark: '#0284c7',
        }
      },
      boxShadow: {
        'diffusion': '0 20px 40px -15px rgba(0,0,0,0.05)',
        'glass-inner': 'inset 0 1px 0 rgba(255,255,255,0.4)',
        'glass-active': 'inset 0 2px 4px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'bento': '2.5rem',
      },
      animation: {
        'scan': 'scan 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-10px)', opacity: '0.5' },
          '50%': { transform: 'translateY(10px)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
