import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          blue: "#77BEF0",
          yellow: "#FFCB61",
          orange: "#FF894F",
          rose: "#EA5B6F",
        },
      },
    },
  },
  plugins: [],
};

export default config;
