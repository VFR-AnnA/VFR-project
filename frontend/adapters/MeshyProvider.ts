// adapters/MeshyProvider.ts
// Adapter to use Meshy.ai SaaS API via the existing Gen3DProvider interface.
// -------------------------------------------------------------

import type { Gen3DProvider, JobStartOptions, JobStatus } from '../lib/gen3d/types';

const MESHY_URL = 'https://api.meshy.ai/openapi/v2/text-to-3d';
const MESHY_PING_URL = 'https://api.meshy.ai/ping';

/**
 * MeshyProvider – implements the Gen3DProvider contract using Meshy.ai SaaS.
 *
 * Requires env var:
 *   MESHY_KEY - secret API key
 */
export class MeshyProvider implements Gen3DProvider {
  // ---------------------------------------------------------------------------
  async startJob(opts: JobStartOptions): Promise<{ jobId: string; previewUrl?: string }> {
    const body = {
      prompt: opts.prompt,
      mode: 'preview',
      art_style: 'realistic',
      topology: 'triangle',
      embed: opts.embed || false
    };

    // Get the API key through the secure provider
    const { getSecureKey, redactKey } = require('../lib/gen3d/SecureKeyProvider');
    const apiKey = getSecureKey('MESHY_KEY', true).trim();
    
    // Log request without exposing sensitive data
    console.log(`[MeshyProvider] Starting job with prompt: "${opts.prompt.substring(0, 30)}...")`);

    // Try to verify the API key is working first
    try {
      const pingRes = await fetch(MESHY_PING_URL, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!pingRes.ok) {
        console.error(`[MeshyProvider] API key validation failed: ${pingRes.status}`);
        const errorBody = await pingRes.text();
        console.error(`[MeshyProvider] Error details: ${errorBody}`);
        throw new Error(`Meshy API key validation failed with status ${pingRes.status}`);
      } else {
        console.log('[MeshyProvider] API key validated successfully');
      }
    } catch (error) {
      // Handle error with proper type checking
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('[MeshyProvider] Could not verify API key (network error), proceeding with generation anyway');
      } else {
        throw error;
      }
    }
    
    const res = await fetch(MESHY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[MeshyProvider] startJob failed with status ${res.status}:`, errorText);
      
      // More helpful error messages
      if (res.status === 401) {
        throw new Error(`Authentication failed. Please verify your MESHY_KEY is correct and has no whitespace.`);
      } else if (res.status === 400) {
        throw new Error(`Invalid request to Meshy API: ${JSON.parse(errorText).message || 'Bad request'}`);
      } else {
        throw new Error(`Meshy startJob failed with status ${res.status}`);
      }
    }
    const json = await res.json();
    const taskId = json.result || json.id;
    
    if (!taskId) {
      throw new Error('Failed to get task ID from Meshy API');
    }
    
    return { jobId: taskId };
  }

  // ---------------------------------------------------------------------------
  async getStatus(jobId: string): Promise<JobStatus> {
    // Get the API key through the secure provider
    const { getSecureKey } = require('../lib/gen3d/SecureKeyProvider');
    const apiKey = getSecureKey('MESHY_KEY').trim();

    const res = await fetch(`${MESHY_URL}/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[MeshyProvider] getStatus failed with status ${res.status}:`, errorText);
      throw new Error(`Meshy getStatus failed with status ${res.status}`);
    }
    const data = await res.json();

    // Get the model URL from the response
    const modelUrl = data.model_urls?.glb;

    return {
      status: data.status,
      url: modelUrl,
    };
  }
}