/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-20T07:27+02:00
 */

// This is a Web Worker for processing body measurements
// It runs in a separate thread to avoid blocking the main thread

import * as poseModule from '@mediapipe/pose';
import { estimateBodyMeasurements, initPoseDetector } from './measure';

// Define the types we need
type WorkerMessage = {
  type: 'process-image';
  imageUrl: string;
  imageHeight: number;
  referenceHeightCm?: number;
};

// Listen for messages from the main thread
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { type, imageUrl, imageHeight, referenceHeightCm } = event.data;

  if (type === 'process-image' && imageUrl) {
    try {
      // Create an image element from the URL
      const img = new Image();
      img.src = imageUrl;
      
      // Wait for the image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image in worker'));
      });

      // Initialize the pose detector
      const pose = await initPoseDetector();

      // Process the image and get results
      const results = await new Promise<poseModule.Results>((resolve, reject) => {
        pose.onResults((results: poseModule.Results) => {
          resolve(results);
        });

        // Send the image to the pose detector
        pose.send({ image: img }).catch(reject);
      });

      if (results.poseLandmarks) {
        // Calculate measurements from landmarks
        const measurements = estimateBodyMeasurements(
          results.poseLandmarks,
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
          error: 'No pose landmarks detected',
          success: false
        });
      }
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error processing image',
        success: false
      });
    }
  }
});

// Export empty object to satisfy TypeScript module requirements
export {};