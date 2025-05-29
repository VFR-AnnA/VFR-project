/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-25T08:55+02:00
 */

"use client";

import dynamic from "next/dynamic";

// ✨ lazy-load so that LCP & INP remain unaffected
const AIAssistFab = dynamic(
  () => import("./Fab"),
  { ssr: false }            // client-only, loads after interactivity
);

export default function ClientFabWrapper() {
  return <AIAssistFab />;
}