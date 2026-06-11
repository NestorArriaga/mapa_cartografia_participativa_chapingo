/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070D",
        surface: "rgba(12, 18, 31, 0.78)",
        surfaceStrong: "rgba(17, 24, 39, 0.88)",
        border: "rgba(148, 163, 184, 0.18)",
        textPrimary: "#E5EEF8",
        textSecondary: "#9FB2C7",
        textMuted: "#64748B",
        
        mapCyan: "#22D3EE",
        mapCyanSoft: "#67E8F9",
        mapElectricBlue: "#38BDF8",
        mapDeepBlue: "#2563EB",
        
        mapNeonGreen: "#39FF88",
        mapGreen: "#22C55E",
        
        mapAmber: "#FBBF24",
        mapOrange: "#FB923C",
        mapCoral: "#FF4D5E",
        mapMagenta: "#F43F9D",
        mapViolet: "#A855F7",
        
        mapRevision: "#A855F7",
        mapSensitive: "#64748B",
        
        priorityMuyAlta: "#FF3B5C",
        priorityAlta: "#FF8A2A",
        priorityMedia: "#FBBF24",
        priorityBaja: "#22D3EE",
        prioritySinDatos: "#475569",
        priorityRecurso: "#39FF88",
        priorityRevision: "#A855F7",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
