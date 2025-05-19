/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:36+02:00
 */

"use client";

import { useRef, useState, useEffect, ChangeEvent } from "react";
import VFRViewerWrapper from "../../../components/VFRViewerWrapper";
import { AvatarParams, DEFAULT_AVATAR_PARAMS, AVATAR_PARAM_RANGES } from "../../../../types/avatar-params";
import { getMeasurementsFromImage } from "../../../utils/measure";
import DropUploader from "../../../components/DropUploader";

// Status states for the detection process
type DetectionStatus = "idle" | "loading" | "success" | "error";

export default function BodyAIDemo() {
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // State
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Revoke object URL when replaced or on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [avatarParams, setAvatarParams] = useState<AvatarParams>(DEFAULT_AVATAR_PARAMS);
  
  // Handle file upload from DropUploader
  const handleFileUpload = async (file: File) => {
    try {
      // Create object URL for the selected image
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setStatus("loading");
      
      // Wait for the image to load before processing
      const img = document.createElement('img');
      img.src = url;
      
      img.onload = async () => {
        URL.revokeObjectURL(url);
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
        URL.revokeObjectURL(url);
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
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🎚️ BodyAIDemo: Slider changed - ${param}: ${value}`);
    }
    setAvatarParams(prev => {
      const newParams = {
        ...prev,
        [param]: value
      };
      if (process.env.NODE_ENV !== 'production') {
        console.log('🎚️ BodyAIDemo: Updated avatar params:', newParams);
      }
      return newParams;
    });
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Image upload and detection */}
        <div className="p-6 flex flex-col">
          <h2 className="text-xl font-medium mb-4">Upload Your Photo</h2>
          
          <div className="mb-6">
            {imageUrl ? (
              <div className="relative w-full h-[400px] mb-4">
                {/* eslint-disable-next-line */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded photo"
                  className="mx-auto max-h-[400px] max-w-full object-contain"
                />
                
                {status === "loading" && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            ) : (
              <DropUploader
                onUpload={handleFileUpload}
                ariaLabel="Upload full-body photo"
                maxFileSize={4 * 1024 * 1024} // 4MB max
                allowMultiple={false}
                className="w-full"
              />
            )}
          </div>
          
          <div className="flex space-x-4">
            {imageUrl && (
              <button
                onClick={handleUploadClick}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload New Photo
              </button>
            )}
            <button
              onClick={handleCameraCapture}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              disabled={status === "loading"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
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
        <div className="bg-gray-100 p-6">
          <h2 className="text-xl font-medium mb-4">Your Custom Avatar</h2>
          
          <div className="mb-6 bg-gray-800 rounded-lg overflow-hidden">
            {/* Pass each parameter directly to ensure they're being passed correctly */}
            <VFRViewerWrapper
              params={{
                heightCm: avatarParams.heightCm,
                chestCm: avatarParams.chestCm,
                waistCm: avatarParams.waistCm,
                hipCm: avatarParams.hipCm
              }}
              showControls={false}
            />
            
            {/* Log the current parameters for debugging */}
            <div className="p-2 bg-black text-white text-xs">
              <pre>
                {JSON.stringify(avatarParams, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height: {avatarParams.heightCm} cm
              </label>
              <input
                type="range"
                min={AVATAR_PARAM_RANGES.heightCm.min}
                max={AVATAR_PARAM_RANGES.heightCm.max}
                value={avatarParams.heightCm}
                onChange={(e) => handleParamChange("heightCm", parseInt(e.target.value))}
                className="w-full"
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
                onChange={(e) => handleParamChange("chestCm", parseInt(e.target.value))}
                className="w-full"
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
                onChange={(e) => handleParamChange("waistCm", parseInt(e.target.value))}
                className="w-full"
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
                onChange={(e) => handleParamChange("hipCm", parseInt(e.target.value))}
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