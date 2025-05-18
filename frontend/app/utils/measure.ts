/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-15T00:33+02:00
 */

import {
  FilesetResolver,
  PoseLandmarker,
  PoseLandmarkerOptions,
  PoseLandmarkerResult,
  NormalizedLandmark
} from '@mediapipe/tasks-vision';

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
function distance3D(a: NormalizedLandmark, b: NormalizedLandmark): number {
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
  landmarks: NormalizedLandmark[],
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
  
  const hipWidth = distance3D(hipLeftPoint as NormalizedLandmark, hipRightPoint as NormalizedLandmark) * imageHeight * pixelToCm;
  
  // Estimate hip circumference (approximation)
  const hipCm = hipWidth * Math.PI * 1.1; // Approximation factor
  
  return {
    heightCm: estimatedHeightCm,
    chestCm: Math.round(chestCm),
    waistCm: Math.round(waistCm),
    hipCm: Math.round(hipCm)
  };
}

// Cache the pose landmarker to avoid recreating it
let poseLandmarker: PoseLandmarker | null = null;

/**
 * Initialize MediaPipe Pose detector using the new Tasks Vision API
 * @returns Promise that resolves to a MediaPipe PoseLandmarker instance
 */
export async function initPoseDetector(): Promise<PoseLandmarker> {
  if (poseLandmarker) return poseLandmarker;

  try {
    // Use FilesetResolver to load the wasm files from CDN
    const fileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    // Create the pose landmarker using the CDN model
    poseLandmarker = await PoseLandmarker.createFromOptions(
      fileset,
      {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
          // Use WebGL for better performance if available
          delegate: 'GPU'
        },
        runningMode: 'IMAGE',
        numPoses: 1
      } as PoseLandmarkerOptions
    );

    console.log('✅ Pose landmarker initialized successfully');

    return poseLandmarker;
  } catch (error) {
    console.error('Error initializing pose landmarker:', error);
    throw new Error('Failed to initialize pose detector');
  }
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
    // Create a canvas to draw the image
    const canvas = document.createElement('canvas');
    canvas.width = imageSource.width;
    canvas.height = imageSource.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    
    // Draw the image to the canvas
    ctx.drawImage(imageSource, 0, 0);
    
    // Get the image data as ImageBitmap
    const imageBitmap = await createImageBitmap(canvas);
    
    // Initialize the pose detector
    const detector = await initPoseDetector();
    
    // Detect poses in the image
    const results = detector.detect(imageBitmap);
    
    if (!results.landmarks || results.landmarks.length === 0) {
      throw new Error('No pose landmarks detected');
    }
    
    // Estimate body measurements from the landmarks
    const measurements = estimateBodyMeasurements(
      results.landmarks[0],
      imageSource.height,
      referenceHeightCm
    );
    
    return measurements;
  } catch (error) {
    console.error('Error detecting pose:', error);
    throw new Error('Failed to detect body measurements');
  }
}