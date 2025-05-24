/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-20T12:10+02:00
 */

"use client";

import { useEffect, useState } from "react";

interface SkeletonAvatarProps {
  isLoading: boolean;
  timeoutMs?: number;
  className?: string;
}

/**
 * SkeletonAvatar component
 * Displays a skeleton placeholder when the avatar is loading
 * Shows after a specified timeout to avoid flickering for fast loads
 */
export default function SkeletonAvatar({
  isLoading,
  timeoutMs = 1000,
  className = ""
}: SkeletonAvatarProps) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      // Only show skeleton after timeout to avoid flickering
      timeoutId = setTimeout(() => {
        setShowSkeleton(true);
      }, timeoutMs);
    } else {
      setShowSkeleton(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, timeoutMs]);

  if (!isLoading || !showSkeleton) {
    return null;
  }

  return (
    <div className={`w-full h-full bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        {/* Skeleton figure */}
        <div className="relative w-24 h-48 mb-4">
          {/* Head */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gray-600 animate-pulse"></div>
          
          {/* Body */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-16 h-20 rounded-md bg-gray-600 animate-pulse"></div>
          
          {/* Arms */}
          <div className="absolute top-16 left-0 w-6 h-16 rounded-md bg-gray-600 animate-pulse"></div>
          <div className="absolute top-16 right-0 w-6 h-16 rounded-md bg-gray-600 animate-pulse"></div>
          
          {/* Legs */}
          <div className="absolute bottom-0 left-1/3 transform -translate-x-1/2 w-6 h-20 rounded-md bg-gray-600 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 transform translate-x-1/2 w-6 h-20 rounded-md bg-gray-600 animate-pulse"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-white text-sm">Loading avatar...</div>
        
        {/* Fake measurements skeleton */}
        <div className="mt-4 w-48 grid grid-cols-2 gap-2">
          <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}