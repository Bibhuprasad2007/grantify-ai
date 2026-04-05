/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0F172A',
        'bg-surface': '#1E293B',
        'bg-elevated': '#334155',
        'accent': '#38BDF8',
        'accent-ai': '#818CF8',
        'text-1': '#F1F5F9',
        'text-2': '#94A3B8',
        'text-3': '#475569',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'border-default': 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        'heading': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body': ['"DM Sans"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'accent-glow': '0 0 20px rgba(56,189,248,0.12)',
        'ai-glow': '0 0 20px rgba(129,140,248,0.12)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'ring-pulse': 'ringPulse 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ringPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(56,189,248,0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(56,189,248,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(56,189,248,0)' },
        }
      }
    },
  },
  plugins: [],
}
