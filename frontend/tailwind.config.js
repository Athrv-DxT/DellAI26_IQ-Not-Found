/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Supabase Design tokens
        bg:        "#ffffff",
        surface:   "#ffffff",
        "surface-2": "#fafafa",
        // Accents
        primary:   "#3ecf8e",
        "primary-deep": "#24b47e",
        "primary-soft": "#4ade80",
        ink:       "#171717",
        "ink-secondary": "#212121",
        "ink-mute": "#707070",
        "ink-mute-2": "#9a9a9a",
        "ink-faint": "#b2b2b2",
        "on-primary": "#171717",
        "on-dark": "#ffffff",
        canvas:    "#ffffff",
        "canvas-soft": "#fafafa",
        "canvas-night": "#1c1c1c",
        "canvas-night-soft": "#202020",
        hairline:  "#dfdfdf",
        "hairline-strong": "#c7c7c7",
        "hairline-cool": "#ededed",
        "hairline-cool-2": "#efefef",
        "hairline-cool-3": "#d4d4d4",
        indigo:    "#3ecf8e", // Compat mapping to emerald green
        sky:       "#054cff", // Accent indigo
        emerald:   "#3ecf8e", // Signature emerald
        amber:     "#ffdb13", // Accent yellow
        rose:      "#ff2201", // Accent tomato
        violet:    "#644fc1", // Accent violet
        
        // Legacy compat
        background:     "#ffffff",
        panel:          "#ffffff",
        inkMuted:       "#707070",
        accentSky:      "#054cff",
        accentEmerald:  "#3ecf8e",
        accentRose:     "#ff2201",
        accentAmber:    "#ffdb13",
      },
      fontFamily: {
        inter:   ["var(--font-inter)",  "Inter", "system-ui", "sans-serif"],
        outfit:  ["var(--font-outfit)", "Outfit", "sans-serif"],
        mono:    ["var(--font-mono)",   "JetBrains Mono", "monospace"],
        // Legacy
        sans:    ["var(--font-inter)",  "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      animation: {
        "fade-up":    "fade-up 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":    "fade-in 0.3s ease both",
        "scale-in":   "scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "shimmer":    "shimmer 4s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        "fade-up":  { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } },
        "fade-in":  { from: { opacity: 0 }, to: { opacity: 1 } },
        "scale-in": { from: { opacity: 0, transform: "scale(0.96)" }, to: { opacity: 1, transform: "scale(1)" } },
        "shimmer":  { from: { backgroundPosition: "-200% center" }, to: { backgroundPosition: "200% center" } },
      },
    },
  },
  plugins: [],
};
