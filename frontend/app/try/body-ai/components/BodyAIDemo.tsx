/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-18T08:17+02:00  |  SHA256: 3dd4…ab9c
 */

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Import the VFRViewerWrapper component with SSR disabled
const VFRViewerWrapper = dynamic(() => import("../../../components/VFRViewerWrapper"), {
  ssr: false,
  loading: () => <div className="w-full h-[480px] bg-gray-100 flex items-center justify-center">Loading 3D Model...</div>
});

// Define the avatar parameters type
type AvatarParams = {
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
};

export default function BodyAIDemo() {
  // Default avatar parameters
  const [avatarParams, setAvatarParams] = useState<AvatarParams>({
    heightCm: 175,
    chestCm: 95,
    waistCm: 80,
    hipCm: 100,
  });

  // Log the current parameters when they change
  useEffect(() => {
    console.log("🎮 VFRViewerWrapper: Current avatarParams:", avatarParams);
  }, [avatarParams]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-zinc-900 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Body Measurements</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="height" className="block text-sm font-medium mb-1">
              Height (cm): {avatarParams.heightCm}
            </label>
            <input
              id="height"
              type="range"
              min="150"
              max="200"
              value={avatarParams.heightCm}
              onChange={(e) => setAvatarParams({ ...avatarParams, heightCm: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="chest" className="block text-sm font-medium mb-1">
              Chest (cm): {avatarParams.chestCm}
            </label>
            <input
              id="chest"
              type="range"
              min="80"
              max="120"
              value={avatarParams.chestCm}
              onChange={(e) => setAvatarParams({ ...avatarParams, chestCm: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="waist" className="block text-sm font-medium mb-1">
              Waist (cm): {avatarParams.waistCm}
            </label>
            <input
              id="waist"
              type="range"
              min="60"
              max="110"
              value={avatarParams.waistCm}
              onChange={(e) => setAvatarParams({ ...avatarParams, waistCm: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="hip" className="block text-sm font-medium mb-1">
              Hip (cm): {avatarParams.hipCm}
            </label>
            <input
              id="hip"
              type="range"
              min="80"
              max="130"
              value={avatarParams.hipCm}
              onChange={(e) => setAvatarParams({ ...avatarParams, hipCm: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Add test buttons for extreme values */}
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Test Controls:</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAvatarParams({
                  heightCm: 190,
                  chestCm: 95,
                  waistCm: 80,
                  hipCm: 100
                })}
                className="bg-blue-600 text-white py-1 px-2 rounded text-xs"
              >
                Tall (190cm)
              </button>
              
              <button
                onClick={() => setAvatarParams({
                  heightCm: 160,
                  chestCm: 95,
                  waistCm: 80,
                  hipCm: 100
                })}
                className="bg-blue-600 text-white py-1 px-2 rounded text-xs"
              >
                Short (160cm)
              </button>
              
              <button
                onClick={() => setAvatarParams({
                  heightCm: 175,
                  chestCm: 115,
                  waistCm: 80,
                  hipCm: 100
                })}
                className="bg-red-600 text-white py-1 px-2 rounded text-xs"
              >
                Large Chest (115cm)
              </button>
              
              <button
                onClick={() => setAvatarParams({
                  heightCm: 175,
                  chestCm: 95,
                  waistCm: 100,
                  hipCm: 100
                })}
                className="bg-red-600 text-white py-1 px-2 rounded text-xs"
              >
                Large Waist (100cm)
              </button>
              
              <button
                onClick={() => setAvatarParams({
                  heightCm: 175,
                  chestCm: 95,
                  waistCm: 80,
                  hipCm: 120
                })}
                className="bg-red-600 text-white py-1 px-2 rounded text-xs"
              >
                Large Hips (120cm)
              </button>
              
              <button
                onClick={() => setAvatarParams({
                  heightCm: 175,
                  chestCm: 95,
                  waistCm: 80,
                  hipCm: 100
                })}
                className="bg-gray-600 text-white py-1 px-2 rounded text-xs"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-zinc-900 p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-4">3D Preview</h2>
        <p className="text-xs text-gray-400 mb-2">Current values: Height={avatarParams.heightCm}cm, Chest={avatarParams.chestCm}cm, Waist={avatarParams.waistCm}cm, Hip={avatarParams.hipCm}cm</p>
        <VFRViewerWrapper key={`${avatarParams.heightCm}-${avatarParams.chestCm}-${avatarParams.waistCm}-${avatarParams.hipCm}`} avatarParams={avatarParams} />
      </motion.div>
    </div>
  );
}