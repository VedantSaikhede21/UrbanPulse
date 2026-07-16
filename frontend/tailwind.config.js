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
        status: {
          new: "#3b82f6",       // Blue
          progress: "#f59e0b",  // Amber
          resolved: "#10b981",  // Emerald
          verified: "#8b5cf6",  // Purple/Indigo
          escalated: "#ef4444", // Red
        },
        priority: {
          low: "#6b7280",       // Gray
          medium: "#eab308",    // Yellow
          high: "#ef4444",      // Red
        }
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
      },
      keyframes: {
        nodePulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(198, 241, 53, 0.7)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 0 10px rgba(198, 241, 53, 0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
