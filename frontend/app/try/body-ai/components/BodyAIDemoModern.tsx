/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-20T21:30+02:LPOP°P
 */

"use client";

import { useRef, useState, useEffect, ChangeEvent, useTransition, useCallback } from "react";
import dynamic from "next/dynamic";
import { AvatarParams, DEFAULT_AVATAR_PARAMS, AVATAR_PARAM_RANGES } from "../../../../types/avatar-params";
import { getMeasurementsFromImage, PoseResults } from "../../../utils/measure";
import { useWebVitals } from "../../../utils/useWebVitals";
import throttle from "lodash/throttle";

// Dynamically import the VFRViewer component with SSR disabled
const VFRViewer = dynamic(() => import("../../../components/VFRViewer"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading 3D Model...</div>
});

// Status states for the detection process
type DetectionStatus = "idle" | "loading" | "success" | "error";

export default function BodyAIDemoModern() {
  // Enable web vitals monitoring
  useWebVitals();
  
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // State
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [avatarParams, setAvatarParams] = useState<AvatarParams>(DEFAULT_AVATAR_PARAMS);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  
  // Add useTransition hook to prevent blocking the main thread
  const [isPending, startTransition] = useTransition();
  
  // Check for WebGL support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');
        if (!gl) {
          setWebglSupported(false);
        }
      } catch (e) {
        setWebglSupported(false);
      }
    }
  }, []);
  
  // Initialize the worker
  useEffect(() => {
    // Hide MediaPipe logs in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const originalConsoleWarn = console.warn;
      
      console.info = () => {};
      console.warn = (msg) => {
        if (!msg?.includes('OpenGL error checking is disabled')) {
          originalConsoleWarn(msg);
        }
      };
    }
    
    // Create the worker only in the browser environment
    if (typeof window !== 'undefined') {
      const bodyAIWorker = new Worker(
        new URL('../../../../workers/bodyAIWorker.ts', import.meta.url),
        { type: 'module' }
      );
      
      // Set up message handler
      bodyAIWorker.onmessage = (event) => {
        const { type, measurements, error, success } = event.data;
        
        if (type === 'measurements-ready' && success) {
          // Always use startTransition to avoid blocking the main thread when updating state
          startTransition(() => {
            setAvatarParams(measurements);
            setStatus("success");
            setModelReady(true);
          });
        } else if (type === 'error') {
          console.error("Error from worker:", error);
          // Use startTransition for error state updates too
          startTransition(() => {
            setStatus("error");
            setErrorMessage(error || "Failed to detect body measurements");
          });
        }
      };
      
      setWorker(bodyAIWorker);
      
      // Clean up the worker when the component unmounts
      return () => {
        bodyAIWorker.terminate();
      };
    }
  }, []);
  
  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !worker) return;
    
    try {
      // Create object URL for the selected image
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setStatus("loading");
      
      // Wait for the image to load before processing
      const img = document.createElement('img');
      img.src = url;
      
      img.onload = async () => {
        try {
          // Dynamically import MediaPipe to avoid Next.js build issues
          await import('@mediapipe/pose');
          
          // Process the image with MediaPipe in the main thread
          const results = await getMeasurementsFromImage(img, true) as PoseResults;
          
          if (results && results.poseLandmarks) {
            // Send landmarks to the worker for measurement calculations
            worker.postMessage({
              type: 'calculate-measurements',
              poseLandmarks: results.poseLandmarks,
              imageHeight: img.height
            });
          } else {
            setStatus("error");
            setErrorMessage("No pose landmarks detected");
          }
        } catch (error) {
          console.error("Error detecting pose:", error);
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Failed to detect body measurements");
        }
      };
      
      img.onerror = () => {
        setStatus("error");
        setErrorMessage("Failed to load image");
      };
    } catch (error) {
      console.error("Error processing file:", error);
      setStatus("error");
      setErrorMessage("Failed to process image file");
    }
  };
  
  // Handle camera capture
  const handleCameraCapture = () => {
    // This would be implemented with getUserMedia API
    alert("Camera capture feature coming soon!");
  };
  
  // Handle parameter change from sliders with throttling to prevent bursts of state updates
  const handleParamChange = useCallback((param: keyof AvatarParams, value: number) => {
    console.log(`🎚️ BodyAIDemoModern: Slider changed - ${param}: ${value}`);
    // Use startTransition to avoid blocking the main thread
    startTransition(() => {
      setAvatarParams(prev => {
        const newParams = {
          ...prev,
          [param]: value
        };
        console.log('🎚️ BodyAIDemoModern: Updated avatar params:', newParams);
        return newParams;
      });
    });
  }, []);
  
  // Create throttled versions of handleParamChange for each parameter
  const handleHeightChange = useCallback((value: number) => {
    throttle((v: number) => handleParamChange("heightCm", v), 16)(value);
  }, [handleParamChange]);
  
  const handleChestChange = useCallback((value: number) => {
    throttle((v: number) => handleParamChange("chestCm", v), 16)(value);
  }, [handleParamChange]);
  
  const handleWaistChange = useCallback((value: number) => {
    throttle((v: number) => handleParamChange("waistCm", v), 16)(value);
  }, [handleParamChange]);
  
  const handleHipChange = useCallback((value: number) => {
    throttle((v: number) => handleParamChange("hipCm", v), 16)(value);
  }, [handleParamChange]);
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // WebGL Fallback component
  const WebGLFallback = ({ className = "" }) => (
    <div className={`bg-neutral-800 rounded-md flex items-center justify-center ${className}`}>
      <div className="text-center p-4">
        <h3 className="text-white text-lg mb-2">WebGL Not Supported</h3>
        <p className="text-gray-300 text-sm">
          Your browser doesn't support 3D rendering. Please try a modern browser like Chrome, Firefox, or Edge.
        </p>
      </div>
    </div>
  );

  // Skeleton Avatar component
  const SkeletonAvatar = ({ className = "" }) => (
    <div className={`bg-neutral-800 rounded-md flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="w-16 h-32 mx-auto relative mb-4">
          {/* Simple skeleton figure with pulsing animation */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-12 h-14 rounded-md bg-gray-600 animate-pulse"></div>
          <div className="absolute bottom-0 left-1/3 transform -translate-x-1/2 w-4 h-14 rounded-md bg-gray-600 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 transform translate-x-1/2 w-4 h-14 rounded-md bg-gray-600 animate-pulse"></div>
        </div>
        <p className="text-white text-sm">Loading avatar...</p>
      </div>
    </div>
  );
  
  return (
    <div className="w-full max-w-screen-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Image upload and detection */}
        <div className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold">Upload Your Photo</h2>
          
          <div className="mb-6">
            <div
              className="w-full aspect-[4/3] border-2 border-dashed border-gray-500/40 rounded-lg overflow-hidden bg-black/20 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleUploadClick}
            >
              {imageUrl ? (
                <div className="relative w-full h-full">
                  {/* eslint-disable-next-line */}
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Uploaded photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Click to upload a full-body photo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                </div>
              )}
              
              {(status === "loading" || isPending) && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload full-body photo"
              title="Upload full-body photo"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleUploadClick}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Photo
            </button>
            <button
              onClick={handleCameraCapture}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Use Camera
            </button>
          </div>
          
          {status === "error" && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              <p className="font-medium">Detection Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
              <p className="font-medium">Measurements Detected!</p>
              <p className="text-sm">Adjust the sliders to fine-tune your avatar.</p>
            </div>
          )}
        </div>
        
        {/* Right column: 3D viewer and sliders */}
        <div className="bg-gray-100 p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold">Your Custom Avatar</h2>
          
          {/* NEW wrapper with responsive aspect ratio - matches photo dropzone */}
          <div className="relative w-full aspect-[4/3] max-w-[600px] rounded-md bg-neutral-800/20 canvas-wrapper">
            {!webglSupported ? (
              <WebGLFallback className="w-full aspect-[4/3] sm:aspect-[4/3]" />
            ) : !modelReady ? (
              <SkeletonAvatar className="w-full aspect-[4/3] sm:aspect-[4/3]" />
            ) : (
              /* The canvas will absolutely fill the wrapper */
              <div className="absolute inset-0">
                <VFRViewer avatarParams={avatarParams} />
              </div>
            )}
          </div>
          
          <div className="space-y-4 mt-6 w-full max-w-[600px]">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height: {avatarParams.heightCm} cm
              </label>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.heightCm.min}
                max={AVATAR_PARAM_RANGES.heightCm.max}
                value={avatarParams.heightCm}
                onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                className="w-full focus:outline-offset-[-2px] focus-visible:outline-offset-[-2px]"
                aria-label={`Height slider: ${avatarParams.heightCm} cm`}
                title={`Adjust height: ${avatarParams.heightCm} cm`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chest: {avatarParams.chestCm} cm
              </label>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.chestCm.min}
                max={AVATAR_PARAM_RANGES.chestCm.max}
                value={avatarParams.chestCm}
                onChange={(e) => handleChestChange(parseInt(e.target.value))}
                className="w-full focus:outline-offset-[-2px] focus-visible:outline-offset-[-2px]"
                aria-label={`Chest slider: ${avatarParams.chestCm} cm`}
                title={`Adjust chest: ${avatarParams.chestCm} cm`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waist: {avatarParams.waistCm} cm
              </label>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.waistCm.min}
                max={AVATAR_PARAM_RANGES.waistCm.max}
                value={avatarParams.waistCm}
                onChange={(e) => handleWaistChange(parseInt(e.target.value))}
                className="w-full focus:outline-offset-[-2px] focus-visible:outline-offset-[-2px]"
                aria-label={`Waist slider: ${avatarParams.waistCm} cm`}
                title={`Adjust waist: ${avatarParams.waistCm} cm`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hip: {avatarParams.hipCm} cm
              </label>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.hipCm.min}
                max={AVATAR_PARAM_RANGES.hipCm.max}
                value={avatarParams.hipCm}
                onChange={(e) => handleHipChange(parseInt(e.target.value))}
                className="w-full focus:outline-offset-[-2px] focus-visible:outline-offset-[-2px]"
                aria-label={`Hip slider: ${avatarParams.hipCm} cm`}
                title={`Adjust hip: ${avatarParams.hipCm} cm`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}