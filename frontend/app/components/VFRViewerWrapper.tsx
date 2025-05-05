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