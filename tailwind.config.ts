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
          background: "#F1F1F1", // Light grey background from logo
          accent: "#33C3F0",    // Bright blue from logo
          text: "#555555",      // Dark grey for text
          card: "#FFFFFF",      // White for cards
          border: "#D3E4FD",    // Light blue for borders
          hover: "#0FA0CE",     // Darker blue for hover states
        }
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
