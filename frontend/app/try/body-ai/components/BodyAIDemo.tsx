/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:36+02:00
 */

"use client";

import { useRef, useState, useEffect, ChangeEvent, useTransition, useCallback, useMemo } from "react";
import SimpleVFRViewer from "../../../components/SimpleVFRViewer";
import { AvatarParams, DEFAULT_AVATAR_PARAMS, AVATAR_PARAM_RANGES } from "../../../../types/avatar-params";
import { PoseLandmarks } from "../../../../types/pose-landmarks";
import { getMeasurementsFromImage } from "../../../utils/measure";
import { useWebVitals } from "../../../utils/useWebVitals";
import { ThemeToggle } from "../../../components/ThemeToggle";
import throttle from "lodash/throttle";

// Status states for the detection process
type DetectionStatus = "idle" | "loading" | "success" | "error";

// Define the PoseResults type
export type PoseResults = {
  poseLandmarks: PoseLandmarks;
};

export default function BodyAIDemo() {
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
  
  // Add useTransition hook to prevent blocking the main thread
  const [isPending, startTransition] = useTransition();
  
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
  
  // Create a function to process images in a non-blocking way
  const processImageNonBlocking = async (img: HTMLImageElement): Promise<{
    success: boolean;
    poseLandmarks?: PoseLandmarks;
    imageHeight?: number;
    error?: string;
  }> => {
    return new Promise((resolve) => {
      // Use requestIdleCallback to process the image when the browser is idle
      const processInBackground = async () => {
        try {
          // Process the image with MediaPipe
          const results = await getMeasurementsFromImage(img, true) as PoseResults;
          
          if (results && results.poseLandmarks) {
            resolve({
              success: true,
              poseLandmarks: results.poseLandmarks,
              imageHeight: img.height
            });
          } else {
            resolve({
              success: false,
              error: "No pose landmarks detected"
            });
          }
        } catch (error) {
          console.error("Error in processImageNonBlocking:", error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : "Failed to detect body measurements"
          });
        }
      };
      
      // Use requestIdleCallback if available, otherwise use setTimeout
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          processInBackground();
        }, { timeout: 2000 });
      } else {
        setTimeout(processInBackground, 0);
      }
    });
  };
  
  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !worker) return;
    
    try {
      // Create object URL for the selected image
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setStatus("loading");
      
      // Create a new image element
      const img = new Image();
      img.src = url;
      
      img.onload = async () => {
        try {
          // Process the image in a non-blocking way
          const result = await processImageNonBlocking(img);
          
          if (result.success) {
            // Send landmarks to the worker for measurement calculations
            worker.postMessage({
              type: 'calculate-measurements',
              poseLandmarks: result.poseLandmarks,
              imageHeight: result.imageHeight
            });
          } else {
            startTransition(() => {
              setStatus("error");
              setErrorMessage(result.error || "Failed to detect body measurements");
            });
          }
        } catch (error) {
          console.error("Error detecting pose:", error);
          startTransition(() => {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Failed to detect body measurements");
          });
        }
      };
      
      img.onerror = () => {
        startTransition(() => {
          setStatus("error");
          setErrorMessage("Failed to load image");
        });
      };
    } catch (error) {
      console.error("Error processing file:", error);
      startTransition(() => {
        setStatus("error");
        setErrorMessage("Failed to process image file");
      });
    }
  };
  
  // Handle camera capture
  const handleCameraCapture = () => {
    // This would be implemented with getUserMedia API
    alert("Camera capture feature coming soon!");
  };
  
  // Create a memoized throttled function for parameter changes
  // This prevents creating new throttled functions on each render
  const throttledParamChange = useMemo(() => {
    return {
      heightCm: throttle((value: number) => {
        startTransition(() => {
          setAvatarParams(prev => ({
            ...prev,
            heightCm: value
          }));
        });
      }, 100),
      chestCm: throttle((value: number) => {
        startTransition(() => {
          setAvatarParams(prev => ({
            ...prev,
            chestCm: value
          }));
        });
      }, 100),
      waistCm: throttle((value: number) => {
        startTransition(() => {
          setAvatarParams(prev => ({
            ...prev,
            waistCm: value
          }));
        });
      }, 100),
      hipCm: throttle((value: number) => {
        startTransition(() => {
          setAvatarParams(prev => ({
            ...prev,
            hipCm: value
          }));
        });
      }, 100)
    };
  }, []);
  
  // Handle parameter change from sliders with throttling to prevent bursts of state updates
  const handleParamChange = useCallback((param: keyof AvatarParams, value: number) => {
    // Use the memoized throttled functions
    if (param in throttledParamChange) {
      throttledParamChange[param as keyof typeof throttledParamChange](value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove throttledParamChange from deps to avoid recreation on each render
  
  // Create handler functions for each parameter
  const handleHeightChange = useCallback((value: number) => {
    handleParamChange("heightCm", value);
  }, [handleParamChange]);
  
  const handleChestChange = useCallback((value: number) => {
    handleParamChange("chestCm", value);
  }, [handleParamChange]);
  
  const handleWaistChange = useCallback((value: number) => {
    handleParamChange("waistCm", value);
  }, [handleParamChange]);
  
  const handleHipChange = useCallback((value: number) => {
    handleParamChange("hipCm", value);
  }, [handleParamChange]);
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full max-w-screen-sm mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Dark mode toggle in the top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Image upload and detection */}
        <div className="p-4 md:p-6 flex flex-col">
          <h2 className="text-xl font-medium mb-3 md:mb-4 dark:text-white">Upload Your Photo</h2>
          
          <div className="mb-6">
            <div
              className="w-full aspect-[4/3] border-2 border-dashed border-gray-500/40 rounded-lg overflow-hidden bg-black/20 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Click to upload a full-body photo</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
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
          
          <div className="flex space-x-2 md:space-x-4">
            <button
              onClick={handleUploadClick}
              className="flex-1 bg-blue-600 text-white py-2 px-3 md:px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Upload Photo
            </button>
            <button
              onClick={handleCameraCapture}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-3 md:px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm md:text-base"
            >
              Use Camera
            </button>
          </div>
          
          {status === "error" && (
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg">
              <p className="font-medium text-sm md:text-base">Detection Error</p>
              <p className="text-xs md:text-sm">{errorMessage}</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-lg">
              <p className="font-medium text-sm md:text-base">Measurements Detected!</p>
              <p className="text-xs md:text-sm">Adjust the sliders to fine-tune your avatar.</p>
            </div>
          )}
        </div>
        
        {/* Right column: 3D viewer and sliders */}
        <div className="bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
          <h2 className="text-xl font-medium mb-3 md:mb-4 dark:text-white">Your Custom Avatar</h2>
          
          <div className="relative w-full md:max-w-[800px] mx-auto mb-6 bg-gray-800 rounded-lg overflow-hidden">
            {/* Use the simplified viewer with avatar parameters */}
            <SimpleVFRViewer height="400px" avatarParams={avatarParams} />
            
            {/* Fixed height placeholder for parameters - no layout shift */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black text-white text-xs h-[56px]">
              <div className="flex justify-center items-center h-full">
                <div className="grid grid-cols-2 gap-x-4 tabular-nums">
                  <div>Height: {avatarParams.heightCm}cm</div>
                  <div>Chest: {avatarParams.chestCm}cm</div>
                  <div>Waist: {avatarParams.waistCm}cm</div>
                  <div>Hip: {avatarParams.hipCm}cm</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 min-h-[240px]">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                // Add passive event listener for better performance
                onTouchStart={(e) => { e.currentTarget.dataset.touching = "true"; }}
                onTouchEnd={(e) => { delete e.currentTarget.dataset.touching; }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                // Add passive event listener for better performance
                onTouchStart={(e) => { e.currentTarget.dataset.touching = "true"; }}
                onTouchEnd={(e) => { delete e.currentTarget.dataset.touching; }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                // Add passive event listener for better performance
                onTouchStart={(e) => { e.currentTarget.dataset.touching = "true"; }}
                onTouchEnd={(e) => { delete e.currentTarget.dataset.touching; }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                // Add passive event listener for better performance
                onTouchStart={(e) => { e.currentTarget.dataset.touching = "true"; }}
                onTouchEnd={(e) => { delete e.currentTarget.dataset.touching; }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}