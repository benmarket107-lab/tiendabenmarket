/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "var(--color-primary)",
        "on-primary": "#ffffff",
        "primary-container": "var(--color-primary-container)",
        "on-primary-container": "#ffffff",
        "secondary": "var(--color-secondary)",
        "on-secondary": "#ffffff",
        "secondary-container": "#fd7681",
        "on-secondary-container": "#710920",
        "tertiary": "#006855",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#00836c",
        "on-tertiary-container": "#eefff7",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "background": "#ffffff",
        "on-background": "#1a1a1a",
        "surface": "#ffffff",
        "on-surface": "#1a1a1a",
        "surface-variant": "#f1f5f9",
        "on-surface-variant": "#475569",
        "outline": "#94a3b8",
        "outline-variant": "#cbd5e1",
        // Escala de grises y containers adaptados
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8fafc", 
        "surface-container": "#f1f5f9",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",
        "surface-bright": "#ffffff",
        "surface-dim": "#e2e8f0",
        "surface-tint": "#b9080c",
        "inverse-surface": "#0f172a",
        "inverse-on-surface": "#f8fafc",
        "inverse-primary": "#f87171",
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
}