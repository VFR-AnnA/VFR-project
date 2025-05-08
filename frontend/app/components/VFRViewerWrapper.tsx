/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

"use client";

import dynamic from "next/dynamic";

// Dynamically import the VFRViewer component with SSR disabled
const VFRViewer = dynamic(() => import("./VFRViewer"), {
  ssr: false,
  loading: () => <div className="w-full h-[480px] bg-gray-100 flex items-center justify-center">Loading 3D Model...</div>
});

export default function VFRViewerWrapper() {
  return <VFRViewer />;
}