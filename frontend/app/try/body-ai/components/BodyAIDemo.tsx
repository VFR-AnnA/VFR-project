/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-18T19:28+02:00
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import debounce from 'lodash/debounce';

// Import the VFRViewerWrapper component with SSR disabled
const VFRViewerWrapper = dynamic(() => import("../../../components/VFRViewerWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] bg-gray-100 flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  )
});

// Define the avatar parameters type
type AvatarParams = {
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
};

// Default parameters
const DEFAULT_PARAMS: AvatarParams = {
  heightCm: 175,
  chestCm: 95,
  waistCm: 80,
  hipCm: 100,
};

export default function BodyAIDemo() {
  // Main state
  const [avatarParams, setAvatarParams] = useState<AvatarParams>({...DEFAULT_PARAMS});
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  
  // UI State flags
  const [uploadDetecting, setUploadDetecting] = useState(false);
  
  // Track if parameters were set from detection (important to prevent overwriting user changes)
  const detectedRef = useRef(false);
  
  // Handle slider changes - debounced to prevent too many updates
  const debouncedSetParams = useMemo(
    () => debounce((newParams: Partial<AvatarParams>) => {
      console.log("🔄 BodyAIDemo: Debounced update of parameters:", newParams);
      setAvatarParams(prev => ({...prev, ...newParams}));
    }, 30), // snellere debounce voor vloeiendere sliders
    []
  );

  // Handler for individual parameter changes (from sliders)
  const handleParamChange = useCallback((key: keyof AvatarParams, value: number) => {
    console.log(`🎮 BodyAIDemo: Slider change - ${key}: ${value}`);
    
    // Use function form of state update for safety
    debouncedSetParams({ [key]: value });
    
    // Markeer dat de gebruiker handmatig de parameters heeft aangepast
    detectedRef.current = true;
  }, [debouncedSetParams]);

  // Handler for test button parameter presets
  const applyPreset = useCallback((newParams: Partial<AvatarParams>) => {
    console.log("🎮 BodyAIDemo: Applying preset:", newParams);
    
    // Use function form to get latest state and merge with preset
    setAvatarParams(prev => ({
      ...prev,
      ...newParams
    }));
  }, []);

  // Handle file upload result - this gets called from VFRViewerWrapper
  const handleUploadResult = useCallback((result: { measurements: AvatarParams, meshPresignedUrl: string | null }) => {
    console.log("🔄 BodyAIDemo: Received upload result:", result);
    
    const { measurements, meshPresignedUrl } = result;
    
    // Als de gebruiker nog geen handmatige aanpassingen heeft gedaan
    // OF als dit de eerste detectie is, update dan de parameters
    if (!detectedRef.current) {
      // Set new parameters from upload
      setAvatarParams(prev => ({...prev, ...measurements}));
      
      // Markeer dat er een detectie is geweest
      detectedRef.current = true;
    } else {
      console.log("ℹ️ User has manually adjusted parameters - not overwriting with detection");
    }
    
    // Update mesh URL - altijd doen, zelfs als parameters niet worden bijgewerkt
    // Gebruik een fallback URL als er geen URL is
    setMeshUrl(meshPresignedUrl || '/models/mannequin.glb');
    
    // Set UI state to show upload is complete
    setUploadDetecting(false);
  }, []);

  // Reset detection flag when component unmounts
  useEffect(() => {
    return () => {
      detectedRef.current = false;
    };
  }, []);

  // Monitor state changes for debugging
  useEffect(() => {
    console.log("🎮 BodyAIDemo: Current avatarParams:", avatarParams);
  }, [avatarParams]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-8">
        {/* Main section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900 p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-4">3D Preview</h2>
          <div className="w-[170px] font-mono text-xs text-gray-400 mb-4 tabular-nums text-right">
            Current values:
            <br />
            Height={avatarParams.heightCm}cm,
            <br />
            Chest={avatarParams.chestCm}cm,
            <br />
            Waist={avatarParams.waistCm}cm,
            <br />
            Hip={avatarParams.hipCm}cm
          </div>
          
          {/* Main content - 3D viewer side by side with vertical sliders */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side: 3D viewer with uploader */}
            <div className="md:w-3/4">
              {/* Fixed height container to prevent layout shifts */}
              <div className="h-[540px] w-full relative">
                <VFRViewerWrapper
                  avatarParams={avatarParams}
                  meshUrl={meshUrl || undefined}
                  showFPS={true}
                  enableUploader={true}
                  onUploadResult={handleUploadResult}
                />
              </div>
            </div>
            
            {/* Right side: Vertical sliders */}
            <div className="md:w-1/4 p-4 bg-zinc-800 rounded-lg">
              <h3 className="text-sm font-medium mb-4">Body Measurements</h3>
              
              <div className="space-y-6">
                {/* Height control */}
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
                    onChange={(e) => handleParamChange("heightCm", parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                    style={{ 
                      background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + 
                                ((avatarParams.heightCm - 150) / (200 - 150) * 100) + 
                                '%, #4b5563 ' + 
                                ((avatarParams.heightCm - 150) / (200 - 150) * 100) + 
                                '%, #4b5563 100%)' 
                    }}
                  />
                </div>
                
                {/* Chest control */}
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
                    onChange={(e) => handleParamChange("chestCm", parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                    style={{ 
                      background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + 
                                ((avatarParams.chestCm - 80) / (120 - 80) * 100) + 
                                '%, #4b5563 ' + 
                                ((avatarParams.chestCm - 80) / (120 - 80) * 100) + 
                                '%, #4b5563 100%)' 
                    }}
                  />
                </div>
                
                {/* Waist control */}
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
                    onChange={(e) => handleParamChange("waistCm", parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                    style={{ 
                      background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + 
                                ((avatarParams.waistCm - 60) / (110 - 60) * 100) + 
                                '%, #4b5563 ' + 
                                ((avatarParams.waistCm - 60) / (110 - 60) * 100) + 
                                '%, #4b5563 100%)' 
                    }}
                  />
                </div>
                
                {/* Hip control */}
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
                    onChange={(e) => handleParamChange("hipCm", parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                    style={{ 
                      background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + 
                                ((avatarParams.hipCm - 80) / (130 - 80) * 100) + 
                                '%, #4b5563 ' + 
                                ((avatarParams.hipCm - 80) / (130 - 80) * 100) + 
                                '%, #4b5563 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Test buttons in a vertical layout */}
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Test Controls:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyPreset({
                      heightCm: 190
                    })}
                    className="bg-blue-600 text-white py-1 px-2 rounded text-xs"
                  >
                    Tall (190cm)
                  </button>
                  
                  <button
                    onClick={() => applyPreset({
                      heightCm: 160
                    })}
                    className="bg-blue-600 text-white py-1 px-2 rounded text-xs"
                  >
                    Short (160cm)
                  </button>
                  
                  <button
                    onClick={() => applyPreset({
                      chestCm: 115
                    })}
                    className="bg-red-600 text-white py-1 px-2 rounded text-xs"
                  >
                    Large Chest (115cm)
                  </button>
                  
                  <button
                    onClick={() => applyPreset({
                      waistCm: 100
                    })}
                    className="bg-red-600 text-white py-1 px-2 rounded text-xs"
                  >
                    Large Waist (100cm)
                  </button>
                  
                  <button
                    onClick={() => applyPreset({
                      hipCm: 120
                    })}
                    className="bg-red-600 text-white py-1 px-2 rounded text-xs"
                  >
                    Large Hips (120cm)
                  </button>
                  
                  <button
                    onClick={() => setAvatarParams({...DEFAULT_PARAMS})}
                    className="bg-gray-600 text-white py-1 px-2 rounded text-xs"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}