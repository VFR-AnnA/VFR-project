/**
 * Mock voor @mediapipe/pose module
 * Dit voorkomt problemen met browser-specifieke code in Jest tests
 */

// Mock NormalizedLandmark type
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

// Mock NormalizedLandmarkList type
export type NormalizedLandmarkList = NormalizedLandmark[];

// Mock Results interface
export interface Results {
  poseLandmarks: NormalizedLandmarkList;
  poseWorldLandmarks: NormalizedLandmarkList;
  segmentationMask: ImageData;
  image: HTMLCanvasElement;
}

// Mock Options interface
export interface Options {
  modelComplexity?: number;
  smoothLandmarks?: boolean;
  enableSegmentation?: boolean;
  smoothSegmentation?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

// Mock Pose class
export class Pose {
  private onResultsCallback: ((results: Results) => void) | null = null;

  constructor(config: { locateFile: (file: string) => string }) {
    // constructor mock
  }

  setOptions(options: Options): Promise<void> {
    return Promise.resolve();
  }

  onResults(callback: (results: Results) => void): void {
    this.onResultsCallback = callback;
  }

  send(config: { image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement }): Promise<void> {
    // Simuleer een succesvolle detectie
    if (this.onResultsCallback) {
      const mockResults = {
        poseLandmarks: [
          { x: 0.5, y: 0.0, z: 0, visibility: 1 }, // NOSE
          ...Array(10).fill({ x: 0, y: 0, z: 0, visibility: 0 }),
          { x: 0.3, y: 0.2, z: 0, visibility: 1 }, // LEFT_SHOULDER
          { x: 0.7, y: 0.2, z: 0, visibility: 1 }, // RIGHT_SHOULDER
          ...Array(10).fill({ x: 0, y: 0, z: 0, visibility: 0 }),
          { x: 0.3, y: 0.5, z: 0, visibility: 1 }, // LEFT_HIP
          { x: 0.7, y: 0.5, z: 0, visibility: 1 }, // RIGHT_HIP
          { x: 0.3, y: 0.7, z: 0, visibility: 1 }, // LEFT_KNEE
          { x: 0.7, y: 0.7, z: 0, visibility: 1 }, // RIGHT_KNEE
          { x: 0.3, y: 1.0, z: 0, visibility: 1 }, // LEFT_ANKLE
          { x: 0.7, y: 1.0, z: 0, visibility: 1 }, // RIGHT_ANKLE
        ],
        poseWorldLandmarks: [],
        segmentationMask: {} as ImageData,
        image: {} as HTMLCanvasElement,
      } as Results;
      
      this.onResultsCallback(mockResults);
    }
    
    return Promise.resolve();
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}