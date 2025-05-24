/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-20T12:10+02:00
 */

"use client";

import { useEffect, useState } from "react";

/**
 * WebGLFallback component
 * Displays a fallback message when WebGL 2 is not supported
 * Similar to <noscript> but for WebGL capabilities
 */
export default function WebGLFallback() {
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    // Check for WebGL 2 support
    const checkWebGLSupport = () => {
      try {
        // Try to create a WebGL 2 context
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2");
        
        if (!gl) {
          console.warn("WebGL 2 not supported by this browser");
          setIsWebGLSupported(false);
          return false;
        }
        
        return true;
      } catch (e) {
        console.error("Error checking WebGL support:", e);
        setIsWebGLSupported(false);
        return false;
      }
    };

    // Only run in browser environment
    if (typeof window !== "undefined") {
      checkWebGLSupport();
    }
  }, []);

  if (isWebGLSupported) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md text-center">
        <svg 
          className="w-16 h-16 mx-auto text-yellow-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        
        <h2 className="text-xl font-bold mb-2">WebGL Not Supported</h2>
        
        <p className="mb-4">
          Your browser doesn&apos;t support WebGL 2, which is required to display 3D content.
        </p>
        
        <p className="text-sm text-gray-600 mb-4">
          Please try using a modern browser like Chrome, Firefox, Edge, or Safari.
        </p>
        
        <div className="flex flex-wrap justify-center gap-2">
          <a 
            href="https://www.google.com/chrome/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
          >
            Chrome
          </a>
          <a 
            href="https://www.mozilla.org/firefox/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 text-sm"
          >
            Firefox
          </a>
          <a 
            href="https://www.microsoft.com/edge/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm"
          >
            Edge
          </a>
          <a 
            href="https://www.apple.com/safari/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
          >
            Safari
          </a>
        </div>
      </div>
    </div>
  );
}