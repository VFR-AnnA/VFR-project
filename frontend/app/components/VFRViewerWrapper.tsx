/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-18T19:23+02:00
 */

"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from "react";
import debounce from 'lodash/debounce';
import FPSOverlay from "./FPSOverlay";
import DropUploader from "./DropUploader";
import { AVATAR_PARAM_RANGES } from "../../types/avatar-params";

// Define the avatar parameters type
export type AvatarParams = {
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
};

// Default avatar parameters
const DEFAULT_AVATAR_PARAMS: AvatarParams = {
  heightCm: 175,
  chestCm: 95,
  waistCm: 80,
  hipCm: 100
};

// Default mesh URL (base mannequin)
// Zorg voor een robuuste default URL die gegarandeerd bestaat
const DEFAULT_MESH_URL = '/models/mannequin.glb';

// Import types voor VFRViewer props
// Deze interface moet exact overeenkomen met de props in VFRViewer
interface VFRViewerProps {
  avatarParams: AvatarParams;
  meshUrl: string;
}

// Dynamically import the VFRViewer component with SSR disabled
// Let op: TypeScript generics om aan te geven welke props de component accepteert
const VFRViewer = dynamic<VFRViewerProps>(() => import("./VFRViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <img src="/placeholder-avatar.svg" alt="Loading 3D Model" className="w-48 h-64" />
        <p className="mt-4 text-gray-500">Loading 3D Model...</p>
      </div>
    </div>
  )
});

// Language context for RTL support
type LanguageContextType = {
  isRTL: boolean;
  toggleDirection: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  isRTL: false,
  toggleDirection: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

// Language provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [isRTL, setIsRTL] = useState(false);
  
  const toggleDirection = () => {
    setIsRTL(prev => !prev);
    document.documentElement.dir = isRTL ? 'ltr' : 'rtl';
  };
  
  return (
    <LanguageContext.Provider value={{ isRTL, toggleDirection }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Simulate an API for detecting measurements and generating a mesh
const api = {
  detectAndMesh: async (file: File): Promise<{
    measurements: AvatarParams,
    meshPresignedUrl: string | null
  }> => {
    // In a real app, this would send the image to a server
    // For simulation, wait 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Generate random measurements
      const measurements = {
        heightCm: Math.floor(160 + Math.random() * 30), // 160-190 cm
        chestCm: Math.floor(85 + Math.random() * 30),   // 85-115 cm
        waistCm: Math.floor(70 + Math.random() * 30),   // 70-100 cm
        hipCm: Math.floor(90 + Math.random() * 30)      // 90-120 cm
      };

      // In a real app, this would return a URL to a generated mesh
      // For simulation, use the same URL but with a random parameter to force refresh
      const meshPresignedUrl = `/models/mannequin.glb?v=${Date.now()}`;
      
      return { measurements, meshPresignedUrl };
    } catch (error) {
      console.error("API error:", error);
      // Return measurements but no mesh URL to simulate backend failure case
      return {
        measurements: { ...DEFAULT_AVATAR_PARAMS },
        meshPresignedUrl: null
      };
    }
  }
};

interface VFRViewerWrapperProps {
  avatarParams?: AvatarParams;
  meshUrl?: string;
  showControls?: boolean;
  showFPS?: boolean;
  enableUploader?: boolean;
  onUploadResult?: (result: { measurements: AvatarParams, meshPresignedUrl: string | null }) => void;
}

export default function VFRViewerWrapper({
  avatarParams: initialParams,
  meshUrl: externalMeshUrl,
  showControls = false,
  showFPS = process.env.NODE_ENV === 'development',
  enableUploader = false,
  onUploadResult
}: VFRViewerWrapperProps) {
  // Track if measurements were detected from an upload
  const detectedRef = useRef(false);
  
  // Merge provided params with defaults
  const [avatarParams, setAvatarParams] = useState<AvatarParams>({
    ...DEFAULT_AVATAR_PARAMS,
    ...initialParams
  });

  // State for the mesh URL - gebruik externe URL als die is opgegeven
  const [meshUrl, setMeshUrl] = useState<string>(externalMeshUrl || DEFAULT_MESH_URL);
  
  // Update meshUrl when externalMeshUrl prop changes
  useEffect(() => {
    if (externalMeshUrl) {
      setMeshUrl(externalMeshUrl);
    }
  }, [externalMeshUrl]);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Update avatarParams when initialParams prop changes
  // Only if we haven't detected measurements from an upload
  useEffect(() => {
    if (!detectedRef.current && initialParams) {
      setAvatarParams(prevParams => ({
        ...prevParams,
        ...initialParams
      }));
    }
  }, [initialParams]);

  // Create debounced parameter change handler
  const debouncedSetParams = useMemo(
    () => debounce((param: keyof AvatarParams, value: number) => {
      console.log(`🎮 VFRViewerWrapper: Debounced parameter change - ${param}: ${value}`);
      
      // Use immutable update pattern
      setAvatarParams(prev => {
        const newParams = {
          ...prev,
          [param]: value
        };
        return newParams;
      });
    }, 30), // 30ms debounce for smoother sliders
    []
  );

  // Handle parameter change from controls
  const handleParamChange = (param: keyof AvatarParams, value: number) => {
    console.log(`🎮 VFRViewerWrapper: Parameter change - ${param}: ${value}`);
    
    // Mark that user has changed parameters
    detectedRef.current = true;
    
    // Use debounced update to prevent too many renders
    debouncedSetParams(param, value);
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    console.log('📤 File upload started:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);
    
    // Reset states
    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log('🔍 Detecting measurements and generating mesh...');
      
      // Call the API to get measurements and mesh in one call
      const { measurements, meshPresignedUrl } = await api.detectAndMesh(file);
      
      console.log('✅ Measurements detected:', measurements);
      console.log('✅ New mesh URL:', meshPresignedUrl || 'Using default fallback');
      
      // Update measurements with immutable pattern to preserve other values
      setAvatarParams(prev => ({ ...prev, ...measurements }));
      
      // Update mesh URL to trigger viewer refresh
      // NOOIT een lege URL laten doorvallen - gebruik altijd default als fallback
      setMeshUrl(meshPresignedUrl || DEFAULT_MESH_URL);
      
      // Mark that we've detected measurements
      detectedRef.current = true;
      
      // Notify parent component with both measurements and mesh URL
      if (onUploadResult) {
        onUploadResult({
          measurements,
          meshPresignedUrl
        });
      }
      
      console.log('✅ Upload processing complete');
    } catch (error) {
      console.error('❌ Error processing image:', error);
      setUploadError('Error processing image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadResult]);

  // Reset detection flag when component unmounts
  useEffect(() => {
    return () => {
      detectedRef.current = false;
    };
  }, []);

  return (
    <div className="vfr-viewer-container">
      {/* FPS Overlay - only shown when enabled */}
      {showFPS && <FPSOverlay enabled={showFPS} />}
      
      {/* File Uploader - only shown when enabled */}
      {enableUploader && (
        <div className="mb-4">
          <DropUploader
            onUpload={handleFileUpload}
            className="w-full"
            ariaLabel="Upload your photo for avatar creation"
          />
          {isUploading && (
            <div className="mt-2 p-2 bg-blue-100 text-blue-700 text-sm rounded flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing image and generating avatar mesh...
            </div>
          )}
          {uploadError && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded">
              {uploadError}
            </div>
          )}
        </div>
      )}
      
      {/*
       * 3D Viewer - use the meshUrl as key to force complete re-render when URL changes
       * Dit zorgt dat React de component volledig verwijdert en opnieuw aanmaakt
       * bij een nieuwe URL, wat problemen met stale state/refs voorkomt
       */}
      <div className="relative h-[540px] w-full" style={{ scrollbarGutter: 'stable' }}>
        {/* Placeholder that's shown until the model loads */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-0">
          <img src="/placeholder-avatar.svg" alt="Avatar Placeholder" className="w-48 h-64" />
        </div>
        
        {/* Actual 3D viewer with absolute positioning */}
        <div className="absolute inset-0 z-10" style={{ scrollbarGutter: 'stable' }}>
          <VFRViewer
            key={`model-${meshUrl}`}
            meshUrl={meshUrl}
            avatarParams={avatarParams}
          />
        </div>
      </div>
      
      {/* Controls - only shown when enabled */}
      {showControls && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Avatar Controls</h3>
          <div className="space-y-3">
            {/* Height control */}
            <div>
              <div className="flex justify-between">
                <label
                  id="height-slider-label"
                  className="block text-xs font-medium text-gray-700"
                >
                  Height
                </label>
                <span className="text-xs text-gray-500">{avatarParams.heightCm} cm</span>
              </div>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.heightCm.min}
                max={AVATAR_PARAM_RANGES.heightCm.max}
                value={avatarParams.heightCm}
                onChange={(e) => handleParamChange("heightCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-labelledby="height-slider-label"
                dir="ltr" // Height is always left-to-right
                data-testid="height-slider"
              />
            </div>
            
            {/* Chest control */}
            <div>
              <div className="flex justify-between">
                <label
                  id="chest-slider-label"
                  className="block text-xs font-medium text-gray-700"
                >
                  Chest
                </label>
                <span className="text-xs text-gray-500">{avatarParams.chestCm} cm</span>
              </div>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.chestCm.min}
                max={AVATAR_PARAM_RANGES.chestCm.max}
                value={avatarParams.chestCm}
                onChange={(e) => handleParamChange("chestCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-labelledby="chest-slider-label"
                dir="ltr" // Chest is always left-to-right
                data-testid="chest-slider"
              />
            </div>
            
            {/* Waist control */}
            <div>
              <div className="flex justify-between">
                <label
                  id="waist-slider-label"
                  className="block text-xs font-medium text-gray-700"
                >
                  Waist
                </label>
                <span className="text-xs text-gray-500">{avatarParams.waistCm} cm</span>
              </div>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.waistCm.min}
                max={AVATAR_PARAM_RANGES.waistCm.max}
                value={avatarParams.waistCm}
                onChange={(e) => handleParamChange("waistCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-labelledby="waist-slider-label"
                dir="ltr" // Waist is always left-to-right
                data-testid="waist-slider"
              />
            </div>
            
            {/* Hip control */}
            <div>
              <div className="flex justify-between">
                <label
                  id="hip-slider-label"
                  className="block text-xs font-medium text-gray-700"
                >
                  Hip
                </label>
                <span className="text-xs text-gray-500">{avatarParams.hipCm} cm</span>
              </div>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.hipCm.min}
                max={AVATAR_PARAM_RANGES.hipCm.max}
                value={avatarParams.hipCm}
                onChange={(e) => handleParamChange("hipCm", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-labelledby="hip-slider-label"
                dir="ltr" // Hip is always left-to-right
                data-testid="hip-slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}