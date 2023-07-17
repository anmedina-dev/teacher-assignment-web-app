import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark", "retro", "winter"],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
} satisfies Config;
