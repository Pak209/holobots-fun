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
        retro: {
          background: "#1A1F2C",
          accent: "#F97316",
          health: "#FF719A",
          highlight: "#9b87f5",
          card: {
            blue: "#0066CC",
            red: "#CC0000",
          }
        },
        cyberpunk: {
          primary: "#FF00FF", // Neon pink
          secondary: "#00FFFF", // Cyan
          accent: "#FFD700", // Gold
          dark: "#1A1A2E", // Dark blue background
          light: "#E5E5E5", // Light gray
          success: "#00FF00", // Neon green
          warning: "#FFA500", // Orange
          danger: "#FF0000", // Red
          info: "#00BFFF", // Deep sky blue
          background: "#0D0D1A", // Darker background
          card: "#1A1A2E", // Slightly lighter background for cards
          border: "#FF00FF40", // Semi-transparent neon pink
        },
      },
      
      boxShadow: {
        'neon': '0 0 5px theme(colors.cyberpunk.primary), 0 0 20px theme(colors.cyberpunk.primary)',
        'neon-cyan': '0 0 5px theme(colors.cyberpunk.secondary), 0 0 20px theme(colors.cyberpunk.secondary)',
        'neon-gold': '0 0 5px theme(colors.cyberpunk.accent), 0 0 20px theme(colors.cyberpunk.accent)',
      },
      
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'glitch': 'glitch 1s ease-in-out infinite',
      },
      
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px theme(colors.cyberpunk.primary), 0 0 20px theme(colors.cyberpunk.primary)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 2px theme(colors.cyberpunk.primary), 0 0 10px theme(colors.cyberpunk.primary)' },
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
