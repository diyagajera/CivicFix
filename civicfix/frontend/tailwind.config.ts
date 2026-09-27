import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: "#1C1B1A",
        concrete: "#E9E6DC",
        "concrete-dim": "#DEDACD",
        paint: "#C9C3B6",
        signal: "#E4572E",
        curb: "#F2B705",
        route: "#2F6844",
        steel: "#3A5A78",
      },
      fontFamily: {
        display: ["var(--font-archivo)", "sans-serif"],
        sans: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
