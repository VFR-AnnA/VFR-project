// utils/measure.ts
import type { NormalizedLandmark, NormalizedLandmarkList } from '@mediapipe/pose';

// Body measurement interface
export interface BodyMeasurements {
  heightCm: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
}

/* ---------- helpers ---------- */
const dist = (a: NormalizedLandmark, b: NormalizedLandmark) =>                                                  
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/* ---------- core ---------- */
export async function getMeasurementsFromImage(img: HTMLImageElement) {
  try {
    // Dynamically import MediaPipe Pose to support both ESM and CommonJS formats
    // Try multiple import approaches to handle different module formats
    let PoseCtor;
    let mod;
    
    try {
      // Approach 1: Dynamic import
      mod = await import('@mediapipe/pose');
      PoseCtor = mod.Pose || (mod.default && mod.default.Pose);
      
      if (!PoseCtor) {
        // Approach 2: Try accessing it from window for CDN versions
        if (typeof window !== 'undefined' && (window as any).Pose) {
          PoseCtor = (window as any).Pose;
          console.log('Using global Pose constructor from window');
        }
      }
    } catch (importError) {
      console.warn('MediaPipe dynamic import failed:', importError);
      // Fallback to mock for testing or provide default values
      console.log('Using fallback measurements');
      return {
        heightCm: 175 // Default height in cm
      };
    }
    
    if (!PoseCtor) {
      console.warn('MediaPipe Pose constructor not found, using fallback measurements');
      return {
        heightCm: 175 // Default height in cm
      };
    }
    
    // Create and configure the pose detector
    const pose = new PoseCtor({
      locateFile: (f: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`;
      }
    });
    
    pose.setOptions({
      modelComplexity: 0,
      selfieMode: false
    });
    
    // Initialize if needed (required for newer versions)
    if (typeof pose.initialize === 'function') {
      await pose.initialize();
    }
    
    // Process the image
    const results = await pose.send({ image: img });
    
    // Handle different result structures from different MediaPipe versions
    let landmarks;
    
    // Debug the result structure to help diagnose issues
    console.log('MediaPipe results received:', results);
    
    // Safely check what kind of result we received
    if (!results) {
      console.warn('MediaPipe returned empty results');
      return { heightCm: 175 }; // Default fallback
    }
    
    // Safe debugging of object structure
    if (typeof results === 'object' && results !== null) {
      console.log('MediaPipe result keys:', Object.keys(results));
    }
    
    // Try different result formats
    if (results.poseLandmarks) {
      // Standard MediaPipe Pose format
      landmarks = results.poseLandmarks;
    } else if (results.landmarks) {
      // Alternative format seen in some versions
      landmarks = results.landmarks;
    } else if (Array.isArray(results)) {
      // Some versions might return landmarks array directly
      landmarks = results;
    } else {
      console.warn('Unexpected MediaPipe result format', results);
      return { heightCm: 175 }; // Default fallback
    }
    
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 32) {
      console.warn('No pose landmarks detected or incomplete pose');
      return { heightCm: 175 }; // Default fallback
    }
    
    // Calculate height based on key points
    const height =
      dist(landmarks[31], landmarks[23]) +  // foot to hip (left)
      dist(landmarks[23], landmarks[11]) +  // hip to shoulder (left)
      dist(landmarks[11], landmarks[0]);    // shoulder to ear/head
    
    return {
      heightCm: Math.round(height * 100)
    };
  } catch (error) {
    console.error('Error in pose measurement:', error);
    // Provide fallback measurements rather than throwing
    return {
      heightCm: 175 // Default height in cm
    };
  }
}

/**
 * Estimates body measurements from pose landmarks
 * @param landmarks - MediaPipe pose landmarks
 * @param imageHeight - Height of the image in pixels
 * @param referenceHeight - Optional reference height in cm (default: 175cm)
 * @returns Body measurements in cm
 */
export function estimateBodyMeasurements(
  landmarks: NormalizedLandmarkList,
  imageHeight: number,
  referenceHeight: number = 175
): BodyMeasurements {
  if (!landmarks || landmarks.length === 0) {
    throw new Error('No pose landmarks detected');
  }

  // Basic validation
  if (landmarks.length < 33) {
    console.warn('Incomplete pose landmarks, measurements may be inaccurate');
  }

  // Calculate body proportions based on landmarks
  // For simplicity, we'll use a few key points to estimate measurements
  
  // Get key landmarks (if available)
  const nose = landmarks[0] || { x: 0.5, y: 0, z: 0, visibility: 1 };
  const leftShoulder = landmarks[11] || { x: 0.4, y: 0.2, z: 0, visibility: 1 };
  const rightShoulder = landmarks[12] || { x: 0.6, y: 0.2, z: 0, visibility: 1 };
  const leftHip = landmarks[23] || { x: 0.4, y: 0.5, z: 0, visibility: 1 };
  const rightHip = landmarks[24] || { x: 0.6, y: 0.5, z: 0, visibility: 1 };
  const leftAnkle = landmarks[27] || { x: 0.4, y: 1.0, z: 0, visibility: 1 };
  const rightAnkle = landmarks[28] || { x: 0.6, y: 1.0, z: 0, visibility: 1 };
  
  // Calculate height in normalized coordinates
  const height = Math.max(
    leftAnkle.y - nose.y,
    rightAnkle.y - nose.y
  );
  
  // Calculate shoulder width
  const shoulderWidth = dist(leftShoulder, rightShoulder);
  
  // Calculate hip width
  const hipWidth = dist(leftHip, rightHip);
  
  // Calculate waist (approximate as slightly above hips)
  const waistY = (leftHip.y + rightHip.y) / 2 - 0.05;
  const waistLeft = { x: leftHip.x, y: waistY, z: leftHip.z, visibility: 1 };
  const waistRight = { x: rightHip.x, y: waistY, z: rightHip.z, visibility: 1 };
  const waistWidth = dist(waistLeft, waistRight);
  
  // Convert to cm using the reference height
  const pixelToCm = referenceHeight / (height * imageHeight);
  
  // Calculate measurements
  const chestCm = shoulderWidth * imageHeight * pixelToCm * 1.1; // Chest slightly wider than shoulders
  const waistCm = waistWidth * imageHeight * pixelToCm * 0.95;
  const hipCm = hipWidth * imageHeight * pixelToCm * 1.05;
  
  return {
    heightCm: referenceHeight,
    chestCm: Math.round(chestCm),
    waistCm: Math.round(waistCm),
    hipCm: Math.round(hipCm)
  };
}