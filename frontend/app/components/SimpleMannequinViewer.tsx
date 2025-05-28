'use client';

import { useEffect } from 'react';

/**
 * Simplified MannequinViewer component that doesn't rely on Three.js
 * This is a fallback for when the Three.js components fail to load
 */
export default function SimpleMannequinViewer({
  height = '450px',
  scale = 1
}: {
  height?: string;
  scale?: number;
}) {
  // Log that we're using the simplified version
  useEffect(() => {
    console.log('Using simplified MannequinViewer (fallback version)');
  }, []);

  return (
    <div
      className="w-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
      style={{ height, minHeight: "300px" }}
    >
      <div className="text-center p-4">
        <div className="w-32 h-48 mx-auto bg-gray-600 rounded-lg mb-4 relative">
          {/* Simple mannequin shape */}
          <div className="w-16 h-16 bg-gray-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          <div className="w-24 h-20 bg-gray-500 absolute top-16 left-1/2 transform -translate-x-1/2"></div>
          <div className="w-6 h-20 bg-gray-500 absolute top-24 left-6"></div>
          <div className="w-6 h-20 bg-gray-500 absolute top-24 right-6"></div>
        </div>
        <p className="text-white text-sm">Mannequin Viewer (Simplified)</p>
        <p className="text-gray-400 text-xs mt-2">Scale: {scale.toFixed(2)}</p>
      </div>
    </div>
  );
}