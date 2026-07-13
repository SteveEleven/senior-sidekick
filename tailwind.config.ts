import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#12304A",
        sky: "#EAF6FC",
        calm: "#1677A8",
      },
    },
  },
  plugins: [],
};

export default config;
