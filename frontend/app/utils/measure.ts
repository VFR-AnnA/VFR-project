/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:33+02:00
 */

import * as poseModule from '@mediapipe/pose';
import { PoseLandmarks, POSE_LANDMARKS } from '../../types/pose-landmarks';

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

/**
 * Calculate Euclidean distance between two 3D points
 */
function distance3D(a: poseModule.NormalizedLandmark, b: poseModule.NormalizedLandmark): number {
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
  landmarks: PoseLandmarks,
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

// Initialize the MediaPipe Pose solution
let pose: poseModule.Pose | null = null;

/**
 * Process an image with MediaPipe Pose and return body measurements
 * @param imageSource - The image source (HTMLImageElement, HTMLVideoElement, HTMLCanvasElement)
 * @param referenceHeightCm - Optional reference height in cm (if known)
 * @returns Promise that resolves to body measurements
 */
export async function getMeasurementsFromImage(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  returnRawResults?: boolean,
  referenceHeightCm?: number
): Promise<BodyMeasurements | PoseResults> {
  try {
    // Create a canvas to draw the image
    const canvas = document.createElement('canvas');
    canvas.width = imageSource.width;
    canvas.height = imageSource.height;
    const ctx = canvas.getContext('2d');
    
    // Initialize MediaPipe Pose if not already initialized
    if (!pose) {
      pose = new poseModule.Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
        }
      });
      
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
    }
    
    return new Promise((resolve, reject) => {
      if (!pose) {
        reject(new Error('Failed to initialize MediaPipe Pose'));
        return;
      }

      pose.onResults((results: poseModule.Results) => {
        if (results.poseLandmarks) {
          try {
            // If returnRawResults is true, return the raw results
            if (returnRawResults) {
              resolve(results);
            } else {
              // Otherwise, calculate and return the measurements
              const measurements = estimateBodyMeasurements(
                results.poseLandmarks,
                imageSource.height,
                referenceHeightCm
              );
              resolve(measurements);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('No pose landmarks detected'));
        }
      });
      
      // Process the image
      if (pose) {
        pose.send({ image: imageSource }).catch(reject);
      } else {
        reject(new Error('MediaPipe Pose is not initialized'));
      }
    });
  } catch (error) {
    console.error('Error detecting pose:', error);
    throw new Error('Failed to detect body measurements');
  }
}