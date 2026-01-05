import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Metadata aplikasi untuk SEO dan Favicon
export const metadata: Metadata = {
  title: "Pokédex App",
  description: "Comprehensive Pokémon encyclopedia created with Next.js",
  icons: {
    icon: "/favicon.ico",
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