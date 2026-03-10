import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: "#06B6D4",
          "cyan-light": "#22D3EE",
          "cyan-dark": "#0891B2",
          purple: "#8B5CF6",
          "purple-light": "#A78BFA",
          "purple-dark": "#7C3AED",
          bg: "#03060F",
          "bg-card": "rgba(6,12,28,0.9)",
          amber: "#F59E0B",
          green: "#10B981",
          red: "#EF4444",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 6s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "spin-slow": "spin 8s linear infinite",
        "neural-pulse": "neuralPulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        typewriter: "typewriter 2s steps(40) forwards",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        neuralPulse: {
          "0%,100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.3)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
      },
      backdropBlur: { xs: "2px" },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(6,182,212,0.4)",
        "glow-purple": "0 0 20px rgba(139,92,246,0.4)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.4)",
        "inner-cyan": "inset 0 0 20px rgba(6,182,212,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
