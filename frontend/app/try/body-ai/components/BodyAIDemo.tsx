/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:36+02:00
 */

"use client";

import { useRef, useState, ChangeEvent } from "react";
import VFRViewerWrapper from "../../../components/VFRViewerWrapper";
import { AvatarParams, DEFAULT_AVATAR_PARAMS, AVATAR_PARAM_RANGES } from "../../../../types/avatar-params";
import { getMeasurementsFromImage } from "../../../utils/measure";
import { ThemeToggle } from "../../../components/ThemeToggle";

// Status states for the detection process
type DetectionStatus = "idle" | "loading" | "success" | "error";

export default function BodyAIDemo() {
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // State
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [avatarParams, setAvatarParams] = useState<AvatarParams>(DEFAULT_AVATAR_PARAMS);
  
  // Handle file selection
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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
          // Dynamically import MediaPipe Tasks Vision to avoid Next.js build issues
          await import('@mediapipe/tasks-vision');
          
          // Process the image with MediaPipe Tasks Vision
          const measurements = await getMeasurementsFromImage(img);
          
          // Update avatar parameters with detected measurements
          setAvatarParams(measurements);
          setStatus("success");
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
  
  // Handle parameter change from sliders
  const handleParamChange = (param: keyof AvatarParams, value: number) => {
    console.log(`🎚️ BodyAIDemo: Slider changed - ${param}: ${value}`);
    setAvatarParams(prev => {
      const newParams = {
        ...prev,
        [param]: value
      };
      console.log('🎚️ BodyAIDemo: Updated avatar params:', newParams);
      return newParams;
    });
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-5xl bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Layout with side-by-side on larger screens and compact view on mobile */}
      <div className="flex flex-col md:flex-row">
        {/* Left column: Image upload and detection */}
        <div className="p-3 md:p-4 lg:p-6 flex flex-col md:w-1/2">
          <h2 className="text-lg md:text-xl font-medium mb-2 md:mb-3 dark:text-white">Upload Your Photo</h2>
          
          <div className="mb-3">
            <div
              className="relative w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={handleUploadClick}
            >
              {/* Always visible placeholder - prevents CLS */}
              <div
                className="w-full aspect-[3/4] bg-zinc-900/60 flex flex-col items-center justify-center text-sm text-zinc-400"
              >
                <svg className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to upload a full-body photo</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
              
              {/* Image overlay when available */}
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded photo"
                  className="absolute inset-0 w-full h-full object-cover"
                  fetchPriority="low"
                />
              )}
              
              {status === "loading" && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
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
          
          <div className="flex space-x-2">
            <button
              onClick={handleUploadClick}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
            >
              Upload Photo
            </button>
            <button
              onClick={handleCameraCapture}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Use Camera
            </button>
          </div>
          
          {status === "error" && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              <p className="font-medium text-sm">Detection Error</p>
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
              <p className="font-medium text-sm">Measurements Detected!</p>
              <p className="text-xs">Adjust the sliders to fine-tune your avatar.</p>
            </div>
          )}
        </div>
        
        {/* Right column: 3D viewer and sliders */}
        <div className="bg-gray-100 dark:bg-gray-900 p-3 md:p-4 lg:p-6 md:w-1/2 section-heavy">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h2 className="text-lg md:text-xl font-medium dark:text-white">Your Custom Avatar</h2>
            
            {/* Dark mode toggle */}
            <ThemeToggle />
          </div>
          
          <div className="mb-3 bg-gray-800 rounded-lg overflow-hidden">
            {/* Fixed aspect ratio container for the 3D viewer */}
            <div className="relative w-full">
              {/* Reserve height with aspect-ratio, prevents overlap */}
              <div className="w-full aspect-[4/3] md:aspect-[16/9]">
                <VFRViewerWrapper
                  params={{
                    heightCm: avatarParams.heightCm,
                    chestCm: avatarParams.chestCm,
                    waistCm: avatarParams.waistCm,
                    hipCm: avatarParams.hipCm
                  }}
                  showControls={false}
                  className="absolute inset-0" // canvas fills the reserved box
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Height: {avatarParams.heightCm} cm
              </label>
              <input
                type="range"
                min={130}
                max={220}
                value={avatarParams.heightCm}
                onChange={(e) => {
                  // Use requestAnimationFrame to debounce slider changes
                  requestAnimationFrame(() => {
                    handleParamChange("heightCm", parseInt(e.target.value));
                  });
                }}
                className="w-full"
                aria-label={`Height slider: ${avatarParams.heightCm} cm`}
                title={`Adjust height: ${avatarParams.heightCm} cm`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chest: {avatarParams.chestCm} cm
              </label>
              <input
                type="range"
                min={60}
                max={140}
                value={avatarParams.chestCm}
                onChange={(e) => {
                  requestAnimationFrame(() => {
                    handleParamChange("chestCm", parseInt(e.target.value));
                  });
                }}
                className="w-full"
                aria-label={`Chest slider: ${avatarParams.chestCm} cm`}
                title={`Adjust chest: ${avatarParams.chestCm} cm`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Waist: {avatarParams.waistCm} cm
              </label>
              <input
                type="range"
                min={60}
                max={140}
                value={avatarParams.waistCm}
                onChange={(e) => {
                  requestAnimationFrame(() => {
                    handleParamChange("waistCm", parseInt(e.target.value));
                  });
                }}
                className="w-full"
                aria-label={`Waist slider: ${avatarParams.waistCm} cm`}
                title={`Adjust waist: ${avatarParams.waistCm} cm`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hip: {avatarParams.hipCm} cm
              </label>
              <input
                type="range"
                min={60}
                max={140}
                value={avatarParams.hipCm}
                onChange={(e) => {
                  requestAnimationFrame(() => {
                    handleParamChange("hipCm", parseInt(e.target.value));
                  });
                }}
                className="w-full"
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