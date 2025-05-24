/**
 * Mock for MediaPipe Pose module
 * This provides test-friendly implementations of the MediaPipe Pose module
 */

export type NormalizedLandmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type NormalizedLandmarkList = NormalizedLandmark[];

export type Results = {
  poseLandmarks: NormalizedLandmarkList;
  poseWorldLandmarks?: NormalizedLandmarkList;
  segmentationMask?: ImageData;
  image?: HTMLCanvasElement;
};

export class Pose {
  private options: any;
  private resultCallback: ((results: Results) => void) | null = null;

  constructor(options: any = {}) {
    this.options = options;
    console.log('Mock Pose initialized with options:', options);
  }

  setOptions(options: any): void {
    this.options = { ...this.options, ...options };
    console.log('Mock Pose options set:', this.options);
  }

  onResults(callback: (results: Results) => void): void {
    this.resultCallback = callback;
    console.log('Mock Pose onResults registered');
  }

  // For newer versions of MediaPipe that require initialization
  async initialize(): Promise<void> {
    console.log('Mock Pose initialized');
    return Promise.resolve();
  }

  async send(input: { image: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement }): Promise<Results> {
    console.log('Mock Pose processing input:', input);
    
    // Create mock landmarks (33 landmarks for a full body)
    const mockLandmarks: NormalizedLandmarkList = Array(33).fill(0).map((_, i) => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      visibility: 0.9
    }));
    
    const results: Results = {
      poseLandmarks: mockLandmarks
    };
    
    // Call the callback if registered
    if (this.resultCallback) {
      this.resultCallback(results);
    }
    
    return results;
  }
}

// Default export for ESM compatibility
export default {
  Pose
};