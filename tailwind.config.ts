import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#071018",
        panel: "#0c1724",
        hospital: {
          50: "#ecfeff",
          100: "#cffafe",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          700: "#0e7490",
          900: "#164e63"
        },
        ocean: "#0b6ee8",
        mint: "#63f6d3",
        graphite: "#121821"
      },
      boxShadow: {
        glow: "0 0 48px rgba(34, 211, 238, 0.22)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.38)"
      },
      backgroundImage: {
        "radial-premium":
          "radial-gradient(circle at 18% 12%, rgba(34, 211, 238, 0.24), transparent 34%), radial-gradient(circle at 82% 8%, rgba(11, 110, 232, 0.22), transparent 31%), linear-gradient(135deg, #06111c 0%, #08131f 46%, #0d1723 100%)"
      }
    }
  },
  plugins: []
};

export default config;
