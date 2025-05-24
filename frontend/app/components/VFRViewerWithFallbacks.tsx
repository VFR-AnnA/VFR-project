/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-20T12:12+02:00
 */

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AvatarParams } from "../../types/avatar-params";
import SkeletonAvatar from "./SkeletonAvatar";
import WebGLFallback from "./WebGLFallback";

// Dynamically import the VFRViewerWrapper component with SSR disabled
const VFRViewerWrapper = dynamic(() => import("./VFRViewerWrapper"), {
  ssr: false,
  loading: () => null // We'll use our own loading state
});

interface VFRViewerWithFallbacksProps {
  params?: Partial<AvatarParams>;
  showControls?: boolean;
  workerTimeoutMs?: number;
}

/**
 * VFRViewerWithFallbacks component
 * Wraps the VFRViewerWrapper component with fallbacks for:
 * 1. WebGL not supported
 * 2. Slow worker processing (shows skeleton after timeout)
 */
export default function VFRViewerWithFallbacks({
  params = {},
  showControls = false,
  workerTimeoutMs = 1000
}: VFRViewerWithFallbacksProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  
  // Check for WebGL support on mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;
    
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      
      if (!gl) {
        console.warn("WebGL 2 not supported by this browser");
        setIsWebGLSupported(false);
      } else {
        setIsWebGLSupported(true);
      }
    } catch (e) {
      console.error("Error checking WebGL support:", e);
      setIsWebGLSupported(false);
    }
  }, []);
  
  // Simulate worker completion after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Simulate loading time
    
    return () => clearTimeout(timer);
  }, []);
  
  // If WebGL is not supported, show the fallback
  if (!isWebGLSupported) {
    return <WebGLFallback />;
  }
  
  return (
    <div className="relative w-full h-full">
      {/* Show skeleton if loading takes too long */}
      <SkeletonAvatar 
        isLoading={isLoading} 
        timeoutMs={workerTimeoutMs}
      />
      
      {/* Actual 3D viewer (hidden while loading) */}
      <div className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <VFRViewerWrapper
          params={params}
          showControls={showControls}
        />
      </div>
    </div>
  );
}

/**
 * Usage example:
 * 
 * <VFRViewerWithFallbacks
 *   params={{
 *     heightCm: 175,
 *     chestCm: 95,
 *     waistCm: 80,
 *     hipCm: 100
 *   }}
 *   showControls={true}
 *   workerTimeoutMs={1000}
 * />
 */