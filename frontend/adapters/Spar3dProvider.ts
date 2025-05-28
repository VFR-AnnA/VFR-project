import type { Gen3DProvider, JobStartOptions, JobStatus } from '../lib/gen3d/types';

/**
 * Provider for Stability AI's Stable Point-Aware 3D (SPAR3D) service
 */
export class Spar3dProvider implements Gen3DProvider {
  private apiUrl: string;
  private activeJobs: Map<string, { status: string; modelUrl?: string }>;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_SPAR3D_API_URL || 'http://localhost:3005';
    this.activeJobs = new Map();
  }

  /**
   * Start a 3D generation job
   * @param opts Options for the job
   * @returns Job ID and optional preview URL
   */
  async startJob(opts: JobStartOptions): Promise<{ jobId: string; previewUrl?: string }> {
    // Generate a unique job ID
    const jobId = `spar3d-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Store the job with PENDING status
    this.activeJobs.set(jobId, { status: 'PENDING' });
    
    console.log(`[Spar3dProvider] Starting job with prompt: "${opts.prompt.substring(0, 30)}..."`);
    
    // Since SPAR3D requires an image, we'll need to handle this differently in the actual implementation
    // For now, we'll just store the job ID and return it
    
    return { jobId };
  }

  /**
   * Get the status of a 3D generation job
   * @param jobId ID of the job
   * @returns Status of the job
   */
  async getStatus(jobId: string): Promise<JobStatus> {
    const job = this.activeJobs.get(jobId);
    
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    return {
      status: job.status as 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED',
      url: job.modelUrl
    };
  }

  /**
   * Generate a 3D model directly from an image and prompt
   * This is a custom method not part of the Gen3DProvider interface
   * but can be used for direct generation
   */
  async generateFromImage(imageData: string, prompt: string = ''): Promise<string> {
    if (!imageData) {
      throw new Error('Image data is required for SPAR3D generation');
    }

    // Create a FormData object to send the image and prompt
    const form = new FormData();
    
    // Convert base64 image data to a Blob
    const imageBlob = this.base64ToBlob(imageData);
    form.append('image', imageBlob, 'image.png');
    
    // Add the prompt if provided
    form.append('prompt', prompt);

    try {
      // Send the request to the SPAR3D API
      const response = await fetch(`${this.apiUrl}/generate`, {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        throw new Error(`SPAR3D API error: ${response.status} ${response.statusText}`);
      }

      // The response is a GLB file
      const glbData = await response.arrayBuffer();
      
      // Create a URL for the GLB data
      return URL.createObjectURL(new Blob([glbData], { type: 'model/gltf-binary' }));
    } catch (error) {
      console.error('Error generating 3D model with SPAR3D:', error);
      throw error;
    }
  }

  /**
   * Convert base64 image data to a Blob
   */
  private base64ToBlob(base64Data: string): Blob {
    // Remove data URL prefix if present
    const base64Content = base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;
    
    // Decode base64
    const byteCharacters = atob(base64Content);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: 'image/png' });
  }
}