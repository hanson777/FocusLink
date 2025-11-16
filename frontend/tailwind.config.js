export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        primaryLight: "#60A5FA",
        accent: "#06B6D4",
        accentLight: "#67E8F9",
        bg: "#020617",
        bgLight: "#0F172A",
        surface: "#0F172A",
        surfaceLight: "#1E293B",
        text: "#E2E8F0",
        textLight: "#F1F5F9",
        danger: "#F43F5E",
        success: "#14B8A6",
      },
      boxShadow: {
        glow: "0 0 16px rgba(6, 182, 212, 0.45)",
      }
    },
  },
  plugins: [],
}