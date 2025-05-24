// adapters/HunyuanProvider.ts
// Adapter to use Tencent Hunyuan 3D v2 SaaS API via the existing Gen3DProvider interface.
// Drop‑in replacement for MeshyAdapter – no changes required in the viewer layer.
// -------------------------------------------------------------

import type { Gen3DProvider, JobStartOptions, JobStatus } from '../lib/gen3d/types';

const BASE_URL = "https://hunyuan.tencentcloudapi.com/v2";
const PING_URL = "https://hunyuan.tencentcloudapi.com/v2/ping";

/**
 * HunyuanProvider – implements the Gen3DProvider contract using Tencent Hunyuan 3D SaaS.
 *
 * Requires two env vars:
 *   HY3D_KEY        – secret API key                (Dashboard ▸ API Keys)
 *   HY3D_REGION     – e.g. ap-shanghai (optional, default cn-shenzhen)
 */
export class HunyuanProvider implements Gen3DProvider {
  // Current region to use
  private currentRegion: string;

  constructor() {
    this.currentRegion = process.env.HY3D_REGION ?? "cn-shenzhen";
  }

  // ---------------------------------------------------------------------------
  async startJob(opts: JobStartOptions): Promise<{ jobId: string; previewUrl?: string }> {
    // Get the API key through the secure provider
    const { getSecureKey, redactKey } = require('../lib/gen3d/SecureKeyProvider');
    const apiKey = getSecureKey('HY3D_KEY', true).trim();
    
    // Log request without exposing sensitive data
    console.log(`[HunyuanProvider] Starting job with prompt: "${opts.prompt.substring(0, 30)}...)" in region ${this.currentRegion}`);
    
    // Try to verify the API key is working first
    try {
      // Add the Version parameter to the ping URL
      const pingUrl = new URL(PING_URL);
      pingUrl.searchParams.append('Version', '2023-11-27');
      
      const pingRes = await fetch(pingUrl.toString(), {
        headers: {
          "X-Api-Key": apiKey,
          "X-Api-Region": this.currentRegion,
          "X-TC-Version": "2023-11-27" // Required Tencent Cloud API version
        }
      });
      
      if (!pingRes.ok) {
        console.error(`[HunyuanProvider] API key validation failed: ${pingRes.status}`);
        const errorBody = await pingRes.text();
        console.error(`[HunyuanProvider] Error details: ${errorBody}`);
        
        // If region seems to be the issue, try alternates
        if (pingRes.status === 401) {
          console.log('[HunyuanProvider] Trying alternate regions...');
          const alternateRegions = ['ap-shanghai', 'ap-beijing', 'ap-guangzhou'];
          
          for (const altRegion of alternateRegions) {
            if (altRegion === this.currentRegion) continue;
            
            console.log(`[HunyuanProvider] Trying region: ${altRegion}`);
            // Add Version parameter to alternate region ping URLs too
            const altPingUrl = new URL(PING_URL);
            altPingUrl.searchParams.append('Version', '2023-11-27');
            
            const altPingRes = await fetch(altPingUrl.toString(), {
              headers: {
                "X-Api-Key": apiKey,
                "X-Api-Region": altRegion,
                "X-TC-Version": "2023-11-27" // Required Tencent Cloud API version
              }
            });
            
            if (altPingRes.ok) {
              console.log(`[HunyuanProvider] Success with region ${altRegion}! Using this region.`);
              // Update the current region for future requests
              this.currentRegion = altRegion;
              break;
            }
          }
        }
      } else {
        console.log('[HunyuanProvider] API key validated successfully');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('[HunyuanProvider] Could not verify API key (network error), proceeding with generation anyway');
      } else {
        console.error('[HunyuanProvider] Error validating API key:', error);
      }
    }
    
    // Debug logging of environment variables (without leaking full key)
    if (process.env.DEBUG_PROVIDERS === 'true') {
      console.log('[debug] HY3D_KEY set?', !!process.env.HY3D_KEY);
      console.log('[debug] Using Hunyuan region:', this.currentRegion);
    }
    
    const body = {
      prompt: opts.prompt,
      mode: opts.mode ?? "avatar", // avatar | clothing | accessory
      embed: opts.embed ?? true,    // true => textures baked in GLB (no CORS hassle)
      quality: opts.quality ?? "high", // draft | high
    };
    
    // Log request details for debugging without exposing the key
    if (process.env.DEBUG_PROVIDERS === 'true') {
      console.log('[debug] Hunyuan request:', {
        url: `${BASE_URL}/text-to-3d?Version=2023-11-27`,
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'REDACTED',
          'X-Api-Region': this.currentRegion,
          'X-TC-Version': '2023-11-27'
        },
        body: JSON.stringify(body, null, 2)
      });
    }

    console.log(`[HunyuanProvider] Making generation request with region: ${this.currentRegion}`);
    
    // Add the Version parameter to the URL and headers
    const generateUrl = new URL(`${BASE_URL}/text-to-3d`);
    generateUrl.searchParams.append('Version', '2023-11-27');
    
    const res = await fetch(generateUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        "X-Api-Region": this.currentRegion,
        "X-TC-Version": "2023-11-27", // Required Tencent Cloud API version
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[HunyuanProvider] startJob failed with status ${res.status}:`, errorText);
      
      // More helpful error messages
      if (res.status === 401) {
        throw new Error(`Authentication failed. Please verify your HY3D_KEY is correct and the region is appropriate.`);
      } else if (res.status === 400) {
        throw new Error(`Invalid request to Hunyuan API: ${errorText}`);
      } else {
        throw new Error(`Hunyuan startJob failed with status ${res.status}`);
      }
    }
    
    const json = await res.json();
    console.log("[HunyuanProvider] Raw response:", JSON.stringify(json, null, 2));
    
    // The response may be nested inside a 'Response' object
    const responseData = json.Response || json;
    
    // Extract the task ID - could be in different fields
    const taskId = responseData.RequestId || responseData.task_id || responseData.taskId;
    
    if (!taskId) {
      console.error("[HunyuanProvider] Failed to find task ID in response:", json);
      throw new Error("Could not extract task ID from Hunyuan API response");
    }
    
    return {
      jobId: taskId,
      previewUrl: responseData.preview_url
    };
  }

  // ---------------------------------------------------------------------------
  async getStatus(jobId: string): Promise<JobStatus> {
    // Get the API key through the secure provider
    const { getSecureKey } = require('../lib/gen3d/SecureKeyProvider');
    const apiKey = getSecureKey('HY3D_KEY').trim();

    console.log(`[HunyuanProvider] Checking status for job ${jobId} in region ${this.currentRegion}`);
    
    // Add the Version parameter to the URL and headers
    const statusUrl = new URL(`${BASE_URL}/status/${jobId}`);
    statusUrl.searchParams.append('Version', '2023-11-27');
    
    const res = await fetch(statusUrl.toString(), {
      headers: {
        "X-Api-Key": apiKey,
        "X-Api-Region": this.currentRegion,
        "X-TC-Version": "2023-11-27", // Required Tencent Cloud API version
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[HunyuanProvider] getStatus failed with status ${res.status}:`, errorText);
      throw new Error(`Hunyuan getStatus failed with status ${res.status}`);
    }
    const data = await res.json();
    // Only log the full response in debug mode to avoid leaking sensitive info
    if (process.env.DEBUG_PROVIDERS === 'true') {
      console.log("[HunyuanProvider] Status response:", JSON.stringify(data, null, 2));
    } else {
      console.log(`[HunyuanProvider] Status check for job ${jobId}: ${res.status}`);
    }
    
    // The response may be nested inside a 'Response' object
    const responseData = data.Response || data;
    
    // Extract status and URL from nested structure if needed
    return {
      status: responseData.state || responseData.Status,
      url: responseData.asset_url_glb || responseData.AssetUrl || responseData.ModelUrl,
    };
  }
}

// -----------------------------------------------------------------------------
// Register provider in the existing factory:
// import { registerProvider } from "../lib/gen3d/ProviderFactory";
// registerProvider("hunyuan", () => new HunyuanProvider());
// -----------------------------------------------------------------------------