import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      serif: ["DM Serif Display", "Georgia", "serif"],
    },
    extend: {
      colors: {
        navy: {
          950: "#060d1a",
          900: "#0b1426",
          800: "#0f1a33",
          700: "#152240",
          600: "#1a2d50",
        },
        teal: {
          500: "#0891b2",
          400: "#06b6d4",
          300: "#22d3ee",
        },
        amber: {
          500: "#d97706",
          400: "#f59e0b",
          300: "#fbbf24",
        },
        stone: {
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          border: "var(--sidebar-border)",
          accent: "var(--sidebar-accent)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "wave": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-25%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "wave": "wave 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
