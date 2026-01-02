import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- KONFIGURASI GAMBAR ---
  // Mengizinkan Next.js memuat gambar dari domain eksternal
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com", // Server gambar Pokemon
        pathname: "/PokeAPI/sprites/**",
      },
    ],
  },
};

export default nextConfig;