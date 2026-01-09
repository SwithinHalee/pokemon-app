import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public", // Folder tujuan file service worker
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // PWA hanya aktif saat production/deploy
});

const nextConfig: NextConfig = {
  // Config gambar (biarkan seperti sebelumnya)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
};

// Bungkus config dengan withPWA
export default withPWA(nextConfig);