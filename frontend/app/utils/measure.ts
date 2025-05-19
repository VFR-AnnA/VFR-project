/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:33+02:00
 */

import * as poseModule from '@mediapipe/pose';

// Define the types we need from MediaPipe
// Use the actual type from MediaPipe
export type PoseResults = poseModule.Results;

// Define the measurement result type
export interface BodyMeasurements {
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
}

// Define the landmarks we need for measurements
// Using the constants from the MediaPipe package
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

/**
 * Calculate Euclidean distance between two 3D points
 */
function distance3D(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + 
    Math.pow(a.y - b.y, 2) + 
    Math.pow(a.z - b.z, 2)
  );
}

/**
 * Estimate body measurements from MediaPipe pose landmarks
 * @param landmarks - The pose landmarks from MediaPipe
 * @param imageHeight - The height of the source image in pixels
 * @param referenceHeightCm - Optional reference height in cm (if known)
 * @returns Body measurements in centimeters
 */
export function estimateBodyMeasurements(
  landmarks: poseModule.NormalizedLandmarkList,
  imageHeight: number,
  referenceHeightCm?: number
): BodyMeasurements {
  if (!landmarks || landmarks.length === 0) {
    throw new Error('No pose landmarks detected');
  }

  // Calculate pixel-to-cm ratio based on estimated or provided height
  const pixelHeight = distance3D(
    landmarks[POSE_LANDMARKS.NOSE],
    landmarks[POSE_LANDMARKS.RIGHT_ANKLE]
  ) * imageHeight;
  
  // Default average height if not provided (175cm)
  const estimatedHeightCm = referenceHeightCm || 175;
  const pixelToCm = estimatedHeightCm / pixelHeight;

  // Calculate chest width (between shoulders)
  const chestWidth = distance3D(
    landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
    landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  ) * imageHeight * pixelToCm;
  
  // Estimate chest circumference (approximation)
  const chestCm = chestWidth * Math.PI * 0.7; // Approximation factor
  
  // Calculate waist width (between hips)
  const waistWidth = distance3D(
    landmarks[POSE_LANDMARKS.LEFT_HIP],
    landmarks[POSE_LANDMARKS.RIGHT_HIP]
  ) * imageHeight * pixelToCm;
  
  // Estimate waist circumference (approximation)
  const waistCm = waistWidth * Math.PI * 0.9; // Approximation factor
  
  // Calculate hip width (slightly below hips)
  const hipLeftPoint = {
    x: landmarks[POSE_LANDMARKS.LEFT_HIP].x,
    y: landmarks[POSE_LANDMARKS.LEFT_HIP].y + 0.05, // Slightly lower than hip
    z: landmarks[POSE_LANDMARKS.LEFT_HIP].z
  };
  
  const hipRightPoint = {
    x: landmarks[POSE_LANDMARKS.RIGHT_HIP].x,
    y: landmarks[POSE_LANDMARKS.RIGHT_HIP].y + 0.05, // Slightly lower than hip
    z: landmarks[POSE_LANDMARKS.RIGHT_HIP].z
  };
  
  const hipWidth = distance3D(hipLeftPoint, hipRightPoint) * imageHeight * pixelToCm;
  
  // Estimate hip circumference (approximation)
  const hipCm = hipWidth * Math.PI * 1.1; // Approximation factor
  
  return {
    heightCm: estimatedHeightCm,
    chestCm: Math.round(chestCm),
    waistCm: Math.round(waistCm),
    hipCm: Math.round(hipCm)
  };
}

/**
 * Initialize MediaPipe Pose detector
 * @returns Promise that resolves to a MediaPipe Pose instance
 */
export async function initPoseDetector(): Promise<poseModule.Pose> {
  // Dynamically import the Pose class to avoid Next.js build issues
  // This is a workaround for the MediaPipe module loading in Next.js
  const { Pose } = await import('@mediapipe/pose');
  
  const pose = new Pose({
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
  });
  
  await pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  
  return pose;
}

/**
 * Process an image with MediaPipe Pose and return body measurements
 * @param imageSource - The image source (HTMLImageElement, HTMLVideoElement, HTMLCanvasElement)
 * @param referenceHeightCm - Optional reference height in cm (if known)
 * @returns Promise that resolves to body measurements
 */
export async function getMeasurementsFromImage(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  referenceHeightCm?: number
): Promise<BodyMeasurements> {
  try {
    const pose = await initPoseDetector() as poseModule.Pose;
    
    return new Promise((resolve, reject) => {
      pose.onResults((results: poseModule.Results) => {
        if (results.poseLandmarks) {
          try {
            const measurements = estimateBodyMeasurements(
              results.poseLandmarks,
              imageSource.height,
              referenceHeightCm
            );
            resolve(measurements);
            pose.close();
          } catch (error) {
            reject(error);
            pose.close();
          }
        } else {
          reject(new Error('No pose landmarks detected'));
          pose.close();
        }
      });

      // Process the image
      pose.send({ image: imageSource }).catch(err => {
        pose.close();
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error initializing pose detector:', error);
    throw new Error('Failed to initialize pose detector');
  }
}