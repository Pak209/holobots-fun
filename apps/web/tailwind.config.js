/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use the root Tailwind config as a base
  presets: [require('../../tailwind.config.ts')],
  // Additional content paths specific to the web app
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  // You can add web-specific customizations here
  theme: {
    extend: {
      // Web-specific theme extensions
    },
  },
} 