/**
 * Types for the 3D generation API providers
 */

/**
 * Options for starting a 3D generation job
 */
export interface JobStartOptions {
  prompt: string;
  mode?: 'avatar' | 'clothing' | 'accessory';
  embed?: boolean;
  quality?: 'draft' | 'high';
}

/**
 * Status of a 3D generation job
 */
export interface JobStatus {
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  url?: string;
}

/**
 * Interface for 3D generation providers
 */
export interface Gen3DProvider {
  /**
   * Start a 3D generation job
   * @param opts Options for the job
   * @returns Job ID and optional preview URL
   */
  startJob(opts: JobStartOptions): Promise<{ jobId: string; previewUrl?: string }>;

  /**
   * Get the status of a 3D generation job
   * @param jobId ID of the job
   * @returns Status of the job
   */
  getStatus(jobId: string): Promise<JobStatus>;
}