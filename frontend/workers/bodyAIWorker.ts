/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-20T08:14+02:00
 */

// This is a Web Worker for processing body measurements calculations
// It runs in a separate thread to avoid blocking the main thread

import { estimateBodyMeasurements } from '../app/utils/measure';
import { PoseLandmarks } from '../types/pose-landmarks';

// Define the types we need
type WorkerMessage = {
  type: 'calculate-measurements';
  poseLandmarks: PoseLandmarks;
  imageHeight: number;
  referenceHeightCm?: number;
};

// Listen for messages from the main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  try {
    const { type, poseLandmarks, imageHeight, referenceHeightCm } = event.data;
    
    if (type === 'calculate-measurements' && poseLandmarks && poseLandmarks.length > 0) {
      // Calculate measurements from landmarks
      const measurements = estimateBodyMeasurements(
        poseLandmarks,
        imageHeight,
        referenceHeightCm
      );
      
      // Send the measurements back to the main thread
      self.postMessage({
        type: 'measurements-ready',
        measurements,
        success: true
      });
    } else {
      self.postMessage({
        type: 'error',
        error: 'Invalid data received',
        success: false
      });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error calculating measurements',
      success: false
    });
  }
});

// Export empty object to satisfy TypeScript module requirements
export {};