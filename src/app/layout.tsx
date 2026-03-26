import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pack Objectifs - CCI Centre Val-de-Loire",
  description: "Application de gestion des projets export pour les conseillers CCI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-gradient-page min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
