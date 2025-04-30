
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
          background: "hsl(var(--background))",
          accent: "#33C3F0",    
          text: "hsl(var(--foreground))",      
          card: "hsl(var(--card))",      
          border: "hsl(var(--border))",    
          hover: "#0FA0CE"      
        },
        // New colors from the requested scheme
        app: {
          primary: '#00E5FF',
          secondary: '#9C27B0',
          background: '#0C1218',
          backgroundLight: '#1A2836',
          text: '#FFFFFF',
          textSecondary: '#AAAAAA',
          error: '#FF3B30',
          success: '#34C759',
          warning: '#FFCC00',
          muted: '#888888',
        },
        // Player rank colors
        rank: {
          rookie: '#cccccc',
          scout: '#4caf50',
          champion: '#2196f3',
          elite: '#9c27b0',
          legend: '#ff9800',
          mythic: '#f44336',
        }
      },
      boxShadow: {
        'neon-blue': '0 0 5px theme(colors.holobots.accent), 0 0 20px theme(colors.holobots.accent)',
        'neon-cyan': '0 0 5px theme(colors.app.primary), 0 0 20px theme(colors.app.primary)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px theme(colors.holobots.accent), 0 0 20px theme(colors.holobots.accent)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 2px theme(colors.holobots.accent), 0 0 10px theme(colors.holobots.accent)' },
        },
        'neon-pulse-cyan': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px theme(colors.app.primary), 0 0 20px theme(colors.app.primary)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 2px theme(colors.app.primary), 0 0 10px theme(colors.app.primary)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'neon-pulse-cyan': 'neon-pulse-cyan 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
