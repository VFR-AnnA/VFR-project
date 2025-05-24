/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { AvatarParams, DEFAULT_AVATAR_PARAMS } from "../../types/avatar-params";

// Dynamically import the VFRViewer component with SSR disabled
const VFRViewer = dynamic(() => import("./VFRViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-2"></div>
        <p className="text-white text-sm">Loading 3D Model...</p>
      </div>
    </div>
  )
});

interface VFRViewerWrapperProps {
  params?: Partial<AvatarParams>;
  showControls?: boolean;
  className?: string;
}

export default function VFRViewerWrapper({
  params = {},
  showControls = false,
  className = ''
}: VFRViewerWrapperProps = {}) {
  // Reference to track if the avatar has been loaded
  const avatarLoadedRef = useRef<boolean>(false);
  
  // Merge params with defaults
  const [avatarParams, setAvatarParams] = useState<AvatarParams>({
    ...DEFAULT_AVATAR_PARAMS,
    ...params
  });

  // Use a ref to store previous params for comparison
  const prevParamsRef = useRef(params);
  
  // Update avatarParams when params prop changes
  useEffect(() => {
    // If the avatar is already loaded, we only need to update the morph targets
    // instead of reloading the entire model
    if (avatarLoadedRef.current) {
      setAvatarParams(prevParams => ({
        ...prevParams,
        ...params
      }));
    } else {
      setAvatarParams(prevParams => ({
        ...prevParams,
        ...params
      }));
      // Mark the avatar as loaded after the first render
      avatarLoadedRef.current = true;
    }
  }, [params]);

  // Set up throttled parameter change handler
  const handleParamChange = useRef<(param: keyof AvatarParams, value: number) => void>(null);
  const rafId = useRef<number>(null);

  useEffect(() => {
    handleParamChange.current = (param: keyof AvatarParams, value: number) => {
      console.log(`🎮 VFRViewerWrapper: Parameter change - ${param}: ${value}`);
      setAvatarParams(prev => {
        const newParams = {
          ...prev,
          [param]: value
        };
        console.log('🎮 VFRViewerWrapper: New avatar params:', newParams);
        return newParams;
      });
    };
  }, []);

  // Throttled update function using requestAnimationFrame
  const throttledUpdate = (param: keyof AvatarParams, value: number) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      handleParamChange.current?.(param, value);
    });
  };

  // Log the current avatar parameters
  console.log('🎮 VFRViewerWrapper: Current avatarParams:', avatarParams);

  return (
    <div className={`vfr-viewer-container w-full h-full mx-auto canvas-wrapper overflow-hidden ${className}`}>
      {/* Pass each parameter directly to ensure they're being passed correctly */}
      <VFRViewer
        avatarParams={{
          heightCm: avatarParams.heightCm,
          chestCm: avatarParams.chestCm,
          waistCm: avatarParams.waistCm,
          hipCm: avatarParams.hipCm
        }}
        isPreloaded={avatarLoadedRef.current}
      />
      
      {showControls && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Avatar Controls</h3>
          <div className="space-y-3">
            {/* Height control */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-medium text-gray-700">
                  Height
                </label>
                <span className="text-xs text-gray-500">{avatarParams.heightCm} cm</span>
              </div>
              <input
                type="range"
                min={150}
                max={200}
                value={avatarParams.heightCm}
                onChange={(e) => throttledUpdate("heightCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label={`Height slider: ${avatarParams.heightCm} cm`}
                title={`Adjust height: ${avatarParams.heightCm} cm`}
              />
            </div>
            
            {/* Chest control */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-medium text-gray-700">
                  Chest
                </label>
                <span className="text-xs text-gray-500">{avatarParams.chestCm} cm</span>
              </div>
              <input
                type="range"
                min={70}
                max={130}
                value={avatarParams.chestCm}
                onChange={(e) => throttledUpdate("chestCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label={`Chest slider: ${avatarParams.chestCm} cm`}
                title={`Adjust chest: ${avatarParams.chestCm} cm`}
              />
            </div>
            
            {/* Waist control */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-medium text-gray-700">
                  Waist
                </label>
                <span className="text-xs text-gray-500">{avatarParams.waistCm} cm</span>
              </div>
              <input
                type="range"
                min={60}
                max={120}
                value={avatarParams.waistCm}
                onChange={(e) => throttledUpdate("waistCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label={`Waist slider: ${avatarParams.waistCm} cm`}
                title={`Adjust waist: ${avatarParams.waistCm} cm`}
              />
            </div>
            
            {/* Hip control */}
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-medium text-gray-700">
                  Hip
                </label>
                <span className="text-xs text-gray-500">{avatarParams.hipCm} cm</span>
              </div>
              <input
                type="range"
                min={80}
                max={140}
                value={avatarParams.hipCm}
                onChange={(e) => throttledUpdate("hipCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label={`Hip slider: ${avatarParams.hipCm} cm`}
                title={`Adjust hip: ${avatarParams.hipCm} cm`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}