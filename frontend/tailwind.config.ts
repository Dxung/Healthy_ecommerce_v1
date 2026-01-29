import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0 0% 100%)",
        foreground: "hsl(215 15% 15%)",
        primary: {
          DEFAULT: "hsl(40 20% 60%)",
          foreground: "hsl(210 20% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(0 0% 0%)",
          foreground: "hsl(0 0% 100%)",
        },
        accent: {
          DEFAULT: "hsl(40 20% 70%)",
          foreground: "hsl(215 15% 15%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(215 15% 15%)",
        },
        muted: {
          DEFAULT: "hsl(40 10% 95%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        border: "hsl(40 10% 85%)",
        input: "hsl(40 10% 90%)",
        ring: "hsl(40 20% 60%)",
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(0 0% 98%)",
        },
        sidebar: {
          background: "hsl(0 0% 0%)",
          foreground: "hsl(0 0% 100%)",
          primary: "hsl(40 20% 50%)",
          "primary-foreground": "hsl(0 0% 100%)",
          accent: "hsl(40 20% 70%)",
          "accent-foreground": "hsl(215 15% 15%)",
          border: "hsl(0 0% 20%)",
          ring: "hsl(40 20% 60%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
