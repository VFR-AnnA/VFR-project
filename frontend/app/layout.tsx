/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProviderWrapper from "./components/ai-assist/ClientProviderWrapper";
import ClientFabWrapper from "./components/ai-assist/ClientFabWrapper";
import TinyNav from "./components/TinyNav";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-10`}
      >
        <TinyNav />
        <ClientProviderWrapper>
          <a href="#main" className="sr-only focus:not-sr-only">
            Skip to main content
          </a>
          <main id="main">{children}</main>
          {/* floating button in bottom-right – fixed slot, no CLS */}
          <ClientFabWrapper />
        </ClientProviderWrapper>
      </body>
    </html>
  );
}
