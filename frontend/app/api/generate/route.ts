// Import server-side provider registration for side-effect
import '../../../lib/gen3d/serverProviderRegistration';

import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled } from '../../config/featureFlags';
import { getProvider } from '../../utils/providerFactory';

export const runtime = 'edge';

// Meshy API configuration - using the correct endpoint from the docs
const MESHY_URL = 'https://api.meshy.ai/openapi/v2/text-to-3d';

// Define types
interface GeneratorOptions {
  prompt: string;
  modelType?: 'avatar' | 'clothing' | 'accessory';
  quality?: 'draft' | 'standard' | 'high';
  format?: 'glb' | 'gltf' | 'usdz';
  texturePrompt?: string;
  enablePBR?: boolean;
  embed?: boolean;
  provider?: 'meshy' | 'hunyuan';
}

interface GeneratorResult {
  id: string;
  url: string;
  format: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  textureUrls?: string[];
}

/**
 * Generate a 3D model using Meshy.ai API
 * For testing purposes, this function returns a local model
 * In a production environment, this would call the Meshy.ai API
 */
async function generate(options: GeneratorOptions): Promise<GeneratorResult> {
  console.log('Generating model with options:', options);
  
  // Verify API key is available
  if (!process.env.MESHY_KEY || process.env.MESHY_KEY === 'your_meshy_api_key_here') {
    throw new Error('API key for Meshy is missing or invalid. Please set MESHY_KEY in your environment variables.');
  }
  
  try {
    console.log('Starting Meshy generation with options:', JSON.stringify(options, null, 2));
    
    // 1. Start the preview generation job
    const startResponse = await fetch(MESHY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MESHY_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: options.prompt,
        mode: 'preview', // Required parameter for Meshy API v2
        art_style: 'realistic',
        topology: 'triangle',
        embed: options.embed || false
      })
    });
    
    // Log the full response for debugging
    console.log('Meshy preview start response status:', startResponse.status);
    
    if (!startResponse.ok) {
      let errorMessage = `HTTP Error ${startResponse.status}: ${startResponse.statusText}`;
      
      try {
        const errorText = await startResponse.text();
        console.error('Meshy API error response:', errorText);
        
        // Try to parse as JSON for structured error
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = `Meshy API error: ${errorJson.message}`;
          }
        } catch (e) {
          // Not JSON, use as plain text
          errorMessage = `Meshy API error: ${startResponse.status} ${startResponse.statusText} - ${errorText}`;
        }
      } catch (e) {
        // If we can't read the response body
        console.error('Could not read error response body', e);
      }
      
      throw new Error(errorMessage);
    }
    
    const startData = await startResponse.json();
    console.log('Meshy preview start response data:', JSON.stringify(startData, null, 2));
    
    // Extract task ID from response - Meshy API v2 returns it in the 'result' field
    const previewTaskId = startData.result || startData.id;
    
    if (!previewTaskId) {
      throw new Error('Failed to get preview task ID from Meshy API');
    }
    
    console.log('Successfully started Meshy preview generation with task ID:', previewTaskId);
    
    // 2. Poll for preview job completion
    // In a production environment, this should be handled by a background job
    // For simplicity in this demo, we'll poll synchronously
    let previewData;
    let attempts = 0;
    const maxAttempts = 30; // Increased max attempts to allow for longer processing
    const baseDelay = 5000; // Base delay in milliseconds (5 seconds)
    
    do {
      // Calculate delay with exponential backoff (5s, 10s, 20s, etc.)
      const delay = Math.min(baseDelay * Math.pow(1.2, attempts), 15000); // Cap at 15 seconds
      console.log(`Waiting ${delay/1000} seconds before polling preview attempt ${attempts + 1}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Polling Meshy API for preview status (attempt ${attempts + 1}/${maxAttempts})...`);
      const statusResponse = await fetch(`${MESHY_URL}/${previewTaskId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MESHY_KEY!}`
        }
      });
      
      console.log('Meshy preview status response status:', statusResponse.status);
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Meshy API preview status error response:', errorText);
        throw new Error(`Meshy API preview status error: ${statusResponse.status} ${statusResponse.statusText} - ${errorText}`);
      }
      
      previewData = await statusResponse.json();
      console.log('Meshy preview status response data:', JSON.stringify(previewData, null, 2));
      console.log(`Current preview status: ${previewData.status}, attempt ${attempts + 1}/${maxAttempts}`);
      
      attempts++;
      
      // Check for terminal states other than SUCCEEDED
      if (previewData.status === 'FAILED' || previewData.status === 'CANCELED') {
        throw new Error(`Meshy preview generation ${previewData.status.toLowerCase()}: ${previewData.message || 'No error message provided'}`);
      }
      
      if (attempts >= maxAttempts && previewData.status !== 'SUCCEEDED') {
        throw new Error(`Meshy preview generation timed out after ${Math.round((maxAttempts * baseDelay * 1.5) / 1000)} seconds. Last status: ${previewData.status}`);
      }
      
    } while ((previewData.status === 'PENDING' || previewData.status === 'IN_PROGRESS') && attempts < maxAttempts);
    
    // Check if PBR refine is enabled via feature flag and options
    const refinePBREnabled = isFeatureEnabled('REFINE_PBR') && options.enablePBR;
    
    // If enablePBR is true and the feature flag is enabled, proceed with the refine step
    if (refinePBREnabled) {
      console.log('Starting Meshy refine step with PBR textures...');
      
      // 3. Start the refine job with PBR textures
      const refineResponse = await fetch(MESHY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MESHY_KEY!}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'refine',
          preview_task_id: previewTaskId,
          enable_pbr: true,
          texture_prompt: options.texturePrompt || 'realistic fabrics and denim',
          embed: options.embed || false
        })
      });
      
      console.log('Meshy refine start response status:', refineResponse.status);
      
      if (!refineResponse.ok) {
        const errorText = await refineResponse.text();
        console.error('Meshy API refine error response:', errorText);
        throw new Error(`Meshy API refine error: ${refineResponse.status} ${refineResponse.statusText} - ${errorText}`);
      }
      
      const refineData = await refineResponse.json();
      console.log('Meshy refine start response data:', JSON.stringify(refineData, null, 2));
      
      // Extract refine task ID
      const refineTaskId = refineData.result || refineData.id;
      
      if (!refineTaskId) {
        throw new Error('Failed to get refine task ID from Meshy API');
      }
      
      console.log('Successfully started Meshy refine with task ID:', refineTaskId);
      
      // 4. Poll for refine job completion
      let refineResultData;
      attempts = 0;
      const refineMaxAttempts = 40; // Longer timeout for refine step (can take 3-5 minutes)
      
      do {
        // Calculate delay with exponential backoff (5s, 10s, 20s, etc.)
        const delay = Math.min(baseDelay * Math.pow(1.2, attempts), 15000); // Cap at 15 seconds
        console.log(`Waiting ${delay/1000} seconds before polling refine attempt ${attempts + 1}/${refineMaxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Polling Meshy API for refine status (attempt ${attempts + 1}/${refineMaxAttempts})...`);
        const refineStatusResponse = await fetch(`${MESHY_URL}/${refineTaskId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.MESHY_KEY!}`
          }
        });
        
        console.log('Meshy refine status response status:', refineStatusResponse.status);
        
        if (!refineStatusResponse.ok) {
          const errorText = await refineStatusResponse.text();
          console.error('Meshy API refine status error response:', errorText);
          throw new Error(`Meshy API refine status error: ${refineStatusResponse.status} ${refineStatusResponse.statusText} - ${errorText}`);
        }
        
        refineResultData = await refineStatusResponse.json();
        console.log('Meshy refine status response data:', JSON.stringify(refineResultData, null, 2));
        console.log(`Current refine status: ${refineResultData.status}, attempt ${attempts + 1}/${refineMaxAttempts}`);
        
        attempts++;
        
        // Check for terminal states other than SUCCEEDED
        if (refineResultData.status === 'FAILED' || refineResultData.status === 'CANCELED') {
          throw new Error(`Meshy refine generation ${refineResultData.status.toLowerCase()}: ${refineResultData.message || 'No error message provided'}`);
        }
        
        if (attempts >= refineMaxAttempts && refineResultData.status !== 'SUCCEEDED') {
          throw new Error(`Meshy refine generation timed out after ${Math.round((refineMaxAttempts * baseDelay * 1.5) / 1000)} seconds. Last status: ${refineResultData.status}`);
        }
        
      } while ((refineResultData.status === 'PENDING' || refineResultData.status === 'IN_PROGRESS') && attempts < refineMaxAttempts);
      
      // Get the refined model URL and texture URLs from the response
      const refinedModelUrl = refineResultData.model_urls?.glb;
      
      if (!refinedModelUrl) {
        console.error('No refined model URL found in response:', refineResultData);
        throw new Error('No refined model URL found in the Meshy API response');
      }
      
      console.log('Successfully generated refined model with URL:', refinedModelUrl);
      console.log('Texture URLs:', refineResultData.texture_urls || []);
      
      // 5. Return the refined result
      return {
        id: refineTaskId,
        url: refinedModelUrl,
        format: options.format || 'glb',
        createdAt: new Date().toISOString(),
        metadata: {
          prompt: options.prompt,
          texturePrompt: options.texturePrompt || 'realistic fabrics and denim',
          modelType: options.modelType || 'avatar',
          quality: options.quality || 'standard',
          isPBR: true
        },
        textureUrls: refineResultData.texture_urls || []
      };
    } else {
      // If enablePBR is false, return the preview model
      const modelUrl = previewData.model_urls?.glb;
      
      if (!modelUrl) {
        console.error('No model URL found in response:', previewData);
        throw new Error('No model URL found in the Meshy API response');
      }
      
      console.log('Successfully generated preview model with URL:', modelUrl);
      
      // Return the preview result
      return {
        id: previewTaskId,
        url: modelUrl,
        format: options.format || 'glb',
        createdAt: new Date().toISOString(),
        metadata: {
          prompt: options.prompt,
          modelType: options.modelType || 'avatar',
          quality: options.quality || 'standard',
          isPBR: false
        }
      };
    }
  } catch (error) {
    console.error('Error generating model:', error);
    // Add more context to the error for better debugging
    const enhancedError = new Error(
      `Failed to generate model: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    // Preserve the stack trace
    if (error instanceof Error) {
      enhancedError.stack = error.stack;
    }
    throw enhancedError;
  }
}

/**
 * POST /api/generate
 * Edge function for generating 3D models
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Please enter a prompt' },
        { status: 400 }
      );
    }
    
    // Prepare generator options
    const options: GeneratorOptions = {
      prompt: body.prompt,
      modelType: body.modelType || 'avatar',
      quality: body.quality || 'standard',
      format: body.format || 'glb',
      // Only enable PBR if the feature flag is enabled
      enablePBR: isFeatureEnabled('REFINE_PBR') && body.enablePBR !== false,
      texturePrompt: body.texturePrompt || 'realistic fabrics and denim',
      embed: body.embed || false,
      provider: body.provider || process.env.GEN_PROVIDER as 'meshy' | 'hunyuan' || 'meshy'
    };
    
    // Get the appropriate provider
    const provider = getProvider(options.provider);
    
    // Call generator function
    const result = await generate(options);
    
    // Return successful response
    return NextResponse.json(result);
  } catch (error) {
    console.error('Generator API error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Failed to generate model';
    
    // Determine more specific error codes
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Set appropriate status codes based on error type
      if (errorMessage.includes('API key')) {
        statusCode = 401; // Unauthorized
      } else if (errorMessage.includes('Invalid request') || errorMessage.includes('validation')) {
        statusCode = 400; // Bad request
      } else if (errorMessage.includes('not found')) {
        statusCode = 404; // Not found
      }
    }
    
    // Return detailed error response with CORS headers
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        // Include additional debugging info in development
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      {
        status: statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

/**
 * GET /api/generate
 * Returns information about the generator service
 */
export async function GET() {
  return NextResponse.json({
    service: 'VFR Generator API',
    version: '0.2.0',
    status: 'operational',
    defaultProvider: process.env.GEN_PROVIDER || 'meshy',
    providers: {
      meshy: {
        name: 'Meshy.ai',
        status: 'operational'
      },
      hunyuan: {
        name: 'Tencent Hunyuan 3D',
        status: 'operational'
      }
    },
    supportedTypes: ['avatar', 'clothing', 'accessory'],
    supportedFormats: ['glb'],
    features: {
      pbrTextures: isFeatureEnabled('REFINE_PBR'),
      texturePrompts: isFeatureEnabled('REFINE_PBR'),
      cdnCaching: isFeatureEnabled('CDN_CACHING'),
      creditTracking: isFeatureEnabled('CREDIT_TRACKING'),
      providerSelection: true
    }
  });
}