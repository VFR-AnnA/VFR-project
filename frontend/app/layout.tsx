/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avatar-Wallet VFR Demo",
  description: "Visual Feature Recognition for Avatar-Wallet - © 2025 Artur Gabrielian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-black dark:text-white`}
      >
        <ThemeProvider defaultTheme="system" storageKey="vfr-theme">
          <a href="#main" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
