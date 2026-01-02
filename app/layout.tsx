import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Load font Inter dari Google Fonts
const inter = Inter({ subsets: ["latin"] });

// --- METADATA SEO ---
// Judul dan deskripsi yang muncul di Google/Tab Browser
export const metadata: Metadata = {
  title: "Pokédex App",
  description: "Comprehensive Pokémon encyclopedia created with Next.js",
  icons: {
    icon: "/favicon.ico", // Pastikan ada file icon atau hapus baris ini
  },
};

// --- ROOT LAYOUT ---
// Wrapper HTML untuk halaman
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen text-gray-900`}>
        {children}
      </body>
    </html>
  );
}