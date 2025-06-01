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
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VFR-Anna Demo | Vercel Commerce Integration",
  description: "Virtual Fitting Room with real-time 3D try-on for e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical 3D assets */}
        <link rel="preload" as="fetch" href="/models/mannequin.glb" crossOrigin="" />
        <link rel="preload" as="fetch" href="/models/clothes/hoodie.glb" crossOrigin="" />
        <link rel="preload" as="fetch" href="/models/clothes/tshirt.glb" crossOrigin="" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16`}
      >
        <Navigation />
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
