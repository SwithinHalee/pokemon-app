import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Metadata aplikasi untuk SEO dan Favicon
export const metadata: Metadata = {
  title: "Pokedex Joshua",
  description: "Aplikasi Pokedex modern dibuat dengan Next.js",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icon-192x192.png', type: 'image/png' },
      { url: '/icon-512x512.png', type: 'image/png' },
    ],
    shortcut: ['/icon-192x192.png'],
    apple: [
      { url: '/icon-192x192.png' },
    ],
  },
};

// Wrapper utama aplikasi 
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