/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0d0d",
        foreground: "#f2f2f2",
        brand: {
          lime: "#C6F135",
          'lime-hover': "#a3c726",
          dim: "#a3c726",
          soft: "rgba(198, 241, 53, 0.08)",
          border: "#1f1f1f",
        },
        panel: {
          bg: "#121212",
          card: "#161616",
          hover: "#1e1e1e",
          border: "#262626",
        },
        surface: {
          canvas: '#0a0a0a',
          base: '#0d0d0d',
          raised: '#121212',
          card: '#161616',
          hover: '#1e1e1e',
          elevated: '#242424',
          overlay: 'rgba(0,0,0,0.7)',
        },
        text: {
          primary: '#f2f2f2',
          secondary: '#a0a0a0',
          tertiary: '#6b7280',
          quaternary: '#4a4a4a',
          inverse: '#0d0d0d',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          default: '#262626',
          strong: '#333333',
          hover: '#404040',
          brand: 'rgba(198,241,53,0.3)',
        },
        status: {
          new: { DEFAULT: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
          progress: { DEFAULT: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
          resolved: { DEFAULT: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
          verified: { DEFAULT: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
          escalated: { DEFAULT: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
        },
        priority: {
          low: { DEFAULT: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
          medium: { DEFAULT: '#eab308', bg: 'rgba(234,179,8,0.1)' },
          high: { DEFAULT: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Fraunces", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'node-active': 'nodePulse 2s infinite',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        nodePulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(198, 241, 53, 0.7)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 0 10px rgba(198, 241, 53, 0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(198,241,53,0.08)',
        'glow': '0 0 20px rgba(198,241,53,0.1), 0 0 60px rgba(198,241,53,0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'elevated': '0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
        'modal': '0 10px 25px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.3)',
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.03em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.10', fontWeight: '700', letterSpacing: '-0.025em' }],
        'display-md': ['2rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.20', fontWeight: '600', letterSpacing: '-0.015em' }],
        'heading': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'subhead': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['0.9375rem', { lineHeight: '1.55' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'label': ['0.6875rem', { lineHeight: '1.3', fontWeight: '500', letterSpacing: '0.02em' }],
        'overline': ['0.625rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.08em' }],
        'code': ['0.8125rem', { lineHeight: '1.5' }],
        'meta': ['0.5625rem', { lineHeight: '1.2', fontWeight: '500', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }],
      },
    },
  },
  plugins: [],
}
