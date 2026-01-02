import type { Config } from "tailwindcss";

const config: Config = {
  // Tentukan file mana saja yang boleh menggunakan class Tailwind
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // Tambahkan folder lib jika ada class di constants
  ],
  theme: {
    extend: {
      // Tambahkan warna/font custom di sini jika perlu
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;