import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        holobots: {
          background: "#F1F1F1",
          accent: "#33C3F0",    
          text: "#555555",      
          card: "#FFFFFF",      
          border: "#D3E4FD",    
          hover: "#0FA0CE",     
        }
      },
      boxShadow: {
        'neon-blue': '0 0 5px theme(colors.holobots.accent), 0 0 20px theme(colors.holobots.accent)',
        'neon-white': '0 0 5px theme(colors.holobots.card), 0 0 20px theme(colors.holobots.card)',
        'neon-border': '0 0 5px theme(colors.holobots.border), 0 0 20px theme(colors.holobots.border)',
      },
      
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'glitch': 'glitch 1s ease-in-out infinite',
      },
      
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px theme(colors.holobots.accent), 0 0 20px theme(colors.holobots.accent)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 2px theme(colors.holobots.accent), 0 0 10px theme(colors.holobots.accent)' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '33%': { transform: 'translate(-2px, 2px)' },
          '66%': { transform: 'translate(2px, -2px)' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;