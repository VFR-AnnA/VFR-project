// Import server-side provider registration for side-effect
import '../../../lib/gen3d/serverProviderRegistration';

import { NextRequest, NextResponse } from 'next/server';
import { isFeatureEnabled } from '../../config/featureFlags';
import { getProvider } from '../../utils/providerFactory';
import { getSecureKey, verifyApiKeys } from '../../../lib/gen3d/SecureKeyProvider';

// Force Node.js runtime to ensure environment variables work correctly
export const runtime = 'nodejs';

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
  imagePrompt?: string; // Base64 encoded image data
}

interface GeneratorResult {
  id: string;
  url: string;
  format: string;
  createdAt: string;
  metadata: Record<string, unknown>;
  textureUrls?: string[];
  measurements?: {
    heightCm: number;
    chestCm: number;
    waistCm: number;
    hipCm: number;
  }; // Object with semantic measurement fields
}

/**
 * Sanitize error messages to prevent leaking sensitive information
 * @param message Original error message
 * @returns Sanitized message
 */
function sanitizeErrorMessage(message: string): string {
  // Don't expose API keys in error messages
  if (message.includes('Bearer ')) {
    message = message.replace(/Bearer [^\s]+/, 'Bearer [REDACTED]');
  }
  
  // Don't expose full error responses that might contain sensitive data
  if (message.includes('errorText')) {
    message = message.replace(/errorText:.*/, 'errorText: [REDACTED]');
  }
  
  // Generic provider errors without revealing implementation details
  if (message.toLowerCase().includes('api key') && message.toLowerCase().includes('invalid')) {
    return 'Provider authentication failed. Please check API key configuration.';
  }
  
  return message;
}

/**
 * Compute measurements from model data
 * @param data The model data from the provider
 * @returns Object with semantic measurement fields
 */
function computeMeasurements(data: any): {
  heightCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
} {
  // This is a placeholder implementation
  // In a real implementation, you would extract measurements from the model data
  // For now, we'll return some dummy values
  return {
    heightCm: 175, // Height in centimeters
    chestCm: 95,   // Chest circumference in centimeters
    waistCm: 80,   // Waist circumference in centimeters
    hipCm: 100     // Hip circumference in centimeters
  };
}

/**
 * Generate a 3D model using Meshy.ai API
 * For testing purposes, this function returns a local model
 * In a production environment, this would call the Meshy.ai API
 */
async function generate(options: GeneratorOptions): Promise<GeneratorResult> {
  console.log('Generating model with options:', options);
  
  // Determine which provider to use
  const providerName = options.provider || process.env.GEN_PROVIDER || 'meshy';
  
  try {
    // Debug logging for environment variables
    if (process.env.DEBUG_PROVIDERS === 'true') {
      console.log('[debug] Meshy key preset?', !!process.env.MESHY_KEY);
      console.log('[debug] Hunyuan key preset?', !!process.env.HY3D_KEY);
      console.log('[debug] Current provider:', providerName);
      console.log('[debug] HY3D_REGION:', process.env.HY3D_REGION || 'not set');
    }
    
    // Verify required API key is available - this will throw if missing
    const apiKey = providerName === 'hunyuan'
      ? getSecureKey('HY3D_KEY')
      : getSecureKey('MESHY_KEY');
    
    // Basic key format validation - don't log the actual key
    if (providerName === 'meshy' && !apiKey.startsWith('msy_')) {
      console.warn('Warning: MESHY_KEY format appears invalid (should start with msy_)');
    }
    
    if (providerName === 'hunyuan' && !apiKey.startsWith('hy_') && !apiKey.startsWith('hunyuan_')) {
      console.warn('Warning: HY3D_KEY format appears invalid (should start with hy_ or hunyuan_)');
    }
    
    // Use the appropriate provider's API
    let startResponse;
    
    if (providerName === 'hunyuan') {
      console.log('Starting Hunyuan generation with options:', JSON.stringify(options, null, 2));
      
      // Prepare the request body
      const requestBody: any = {
        mode: options.modelType || 'avatar',
        quality: options.quality || 'high',
        embed: options.embed !== undefined ? options.embed : true,
        input_media_type: options.imagePrompt ? 'IMAGE' : 'TEXT'
      };
      
      // Always include the text prompt, ensure it's never empty
      requestBody.prompt = options.prompt.trim() || '(image prompt)';
      
      // Add image prompt if provided
      if (options.imagePrompt) {
        // Extract the base64 data from the data URL
        const base64Data = options.imagePrompt.split(',')[1];
        if (base64Data) {
          requestBody.image_base64 = base64Data;
          console.log('Including image prompt in Hunyuan API request with IMAGE input_media_type');
        } else {
          console.warn('Invalid image prompt format, ignoring image prompt');
          // Fallback to TEXT mode if image is invalid
          requestBody.input_media_type = 'TEXT';
        }
      }
      
      // Debug the request details
      if (process.env.DEBUG_PROVIDERS === 'true') {
        console.log('[debug] → POST https://hunyuan.tencentcloudapi.com/v2/text-to-3d');
        console.log('[debug] Request body:', JSON.stringify(requestBody, null, 2));
        console.log('[debug] Headers:', {
          'Content-Type': 'application/json',
          'X-Api-Key': 'REDACTED', // Don't log the actual key
          'X-Api-Region': process.env.HY3D_REGION || 'cn-shenzhen'
        });
      }
      
      // 1. Start the Hunyuan generation job with correct endpoint and version parameter
      const hunyuanUrl = 'https://hunyuan.tencentcloudapi.com/v2/text-to-3d';

      startResponse = await fetch(hunyuanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
          'X-Api-Region': process.env.HY3D_REGION || 'cn-shenzhen',
          'X-TC-Version': '2023-11-27' // Required parameter from test results
        },
        body: JSON.stringify(requestBody)
      });
      
      // Log the full response for debugging
      console.log('Hunyuan start response status:', startResponse.status);
    } else {
      console.log('Starting Meshy generation with options:', JSON.stringify(options, null, 2));
      
      // 1. Start the Meshy preview generation job
      const meshy_request_body: any = {
        mode: options.imagePrompt ? 'TEXT_AND_IMAGE' : 'preview', // Use TEXT_AND_IMAGE mode when image is provided
        art_style: 'realistic',
        topology: 'triangle',
        embed: options.embed || false,
        prompt: options.prompt.trim() || '(image prompt)', // Ensure prompt is never empty
        inputs: []
      };
      
      // Always add text input
      meshy_request_body.inputs.push({
        type: 'text',
        data: options.prompt.trim() || '(image prompt)' // Use default text if prompt is empty
      });
      
      // Add image prompt if provided
      if (options.imagePrompt) {
        // Extract the base64 data from the data URL
        const base64Data = options.imagePrompt.split(',')[1];
        if (base64Data) {
          // Add image to inputs array
          meshy_request_body.inputs.push({
            type: 'image',
            data: options.imagePrompt // Keep full data URL
          });
          console.log('Including image prompt in Meshy API request with TEXT_AND_IMAGE mode');
        } else {
          console.warn('Invalid image prompt format, ignoring image prompt');
        }
      }
      
      startResponse = await fetch(MESHY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meshy_request_body)
      });
      
      // Log the full response for debugging
      console.log('Meshy preview start response status:', startResponse.status);
    }
    
    if (!startResponse.ok) {
      let errorMessage = `HTTP Error ${startResponse.status}: ${startResponse.statusText}`;
      
      try {
        const errorText = await startResponse.text();
        // Log full error details for internal debugging without exposing sensitive data
        console.error(`${providerName} API error response:`, errorText);
        
        // Try to parse as JSON for structured error
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            // Sanitize error message to avoid leaking sensitive information
            errorMessage = sanitizeErrorMessage(`${providerName === 'hunyuan' ? 'Hunyuan' : 'Meshy'} API error: ${errorJson.message}`);
          }
        } catch (e) {
          // Not JSON, use as plain text with sanitization
          errorMessage = sanitizeErrorMessage(`${providerName === 'hunyuan' ? 'Hunyuan' : 'Meshy'} API error: ${startResponse.status} ${startResponse.statusText}`);
        }
      } catch (e) {
        // If we can't read the response body
        console.error('Could not read error response body', e);
      }
      
      throw new Error(errorMessage);
    }
    
    const startData = await startResponse.json();
    console.log(`${providerName} start response data:`, JSON.stringify(startData, null, 2));
    
    // DEBUG: Log the raw response for debugging
    if (process.env.DEBUG_PROVIDERS === "true") {
      console.log("📦 Raw response from provider:", JSON.stringify(startData, null, 2));
    }
    
    // Extract task ID from response based on provider
    let previewTaskId;
    
    if (providerName === 'hunyuan') {
      // Hunyuan response might be nested in Response object
      const hunyuanData = startData.Response || startData;
      
      // Check for RequestId in Hunyuan response
      if (hunyuanData.RequestId) {
        previewTaskId = hunyuanData.RequestId;
      } else if (hunyuanData.Error) {
        // Handle error case but still try to get RequestId
        previewTaskId = hunyuanData.RequestId;
        console.warn(`Hunyuan API returned error: ${hunyuanData.Error.Message || 'Unknown error'}`);
      } else {
        // Look for various possible field names
        previewTaskId = hunyuanData.task_id || hunyuanData.taskId || hunyuanData.request_id || hunyuanData.id;
      }
      
      console.log("Extracted Hunyuan task ID:", previewTaskId);
    } else {
      // Meshy API v2 returns it in the 'result' field or 'id' field
      previewTaskId = startData.result || startData.id;
    }
    
    if (!previewTaskId) {
      throw new Error(`Failed to get task ID from ${providerName === 'hunyuan' ? 'Hunyuan' : 'Meshy'} API`);
    }
    
    console.log(`Successfully started ${providerName} generation with task ID:`, previewTaskId);
    
    // 2. Poll for preview job completion
    // In a production environment, this should be handled by a background job
    // For simplicity in this demo, we'll poll synchronously
    let previewData;
    let attempts = 0;
    let currentStatus = ''; // Add status variable with wider scope
    const maxAttempts = 30; // Increased max attempts to allow for longer processing
    const baseDelay = 5000; // Base delay in milliseconds (5 seconds)
    
    do {
      // Calculate delay with exponential backoff (5s, 10s, 20s, etc.)
      const delay = Math.min(baseDelay * Math.pow(1.2, attempts), 15000); // Cap at 15 seconds
      console.log(`Waiting ${delay/1000} seconds before polling attempt ${attempts + 1}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      let statusResponse;
      
      if (providerName === 'hunyuan') {
        console.log(`Polling Hunyuan API for status (attempt ${attempts + 1}/${maxAttempts})...`);
        // Add required version parameter for status endpoint too
        const statusUrl = `https://hunyuan.tencentcloudapi.com/v2/status/${previewTaskId}`;

        statusResponse = await fetch(statusUrl, {
          headers: {
            'X-Api-Key': apiKey,
            'X-Api-Region': process.env.HY3D_REGION || 'cn-shenzhen',
            'X-TC-Version': '2023-11-27'
          }
        });
        
        console.log('Hunyuan status response status:', statusResponse.status);
      } else {
        console.log(`Polling Meshy API for preview status (attempt ${attempts + 1}/${maxAttempts})...`);
        statusResponse = await fetch(`${MESHY_URL}/${previewTaskId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        console.log('Meshy preview status response status:', statusResponse.status);
      }
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        // Log full error details internally
        console.error(`${providerName} API status error response:`, errorText);
        // Return sanitized error to client
        throw new Error(sanitizeErrorMessage(`${providerName === 'hunyuan' ? 'Hunyuan' : 'Meshy'} API status error: ${statusResponse.status} ${statusResponse.statusText}`));
      }
      
      previewData = await statusResponse.json();
      console.log(`${providerName} status response data:`, JSON.stringify(previewData, null, 2));
      
      // Normalize status field name (Hunyuan uses 'state', Meshy uses 'status')
      currentStatus = providerName === 'hunyuan' ? previewData.state : previewData.status;
      console.log(`Current status: ${currentStatus}, attempt ${attempts + 1}/${maxAttempts}`);
      
      attempts++;
      
      // Check for terminal states other than SUCCEEDED
      if (currentStatus === 'FAILED' || currentStatus === 'CANCELED') {
        throw new Error(`${providerName === 'hunyuan' ? 'Hunyuan' : 'Meshy'} generation ${currentStatus.toLowerCase()}: ${previewData.message || 'No error message provided'}`);
      }
      
      if (attempts >= maxAttempts && currentStatus !== 'SUCCEEDED') {
        throw new Error(`${providerName === 'hunyuan' ? 'Hunyuan' : 'Meshy'} generation timed out after ${Math.round((maxAttempts * baseDelay * 1.5) / 1000)} seconds. Last status: ${currentStatus}`);
      }
      
    } while ((currentStatus === 'PENDING' || currentStatus === 'IN_PROGRESS') && attempts < maxAttempts);
    
    // Check if PBR refine is enabled via feature flag and options
    const refinePBREnabled = isFeatureEnabled('REFINE_PBR') && options.enablePBR;
    
    // If enablePBR is true and the feature flag is enabled, proceed with the refine step
    if (refinePBREnabled) {
      console.log('Starting Meshy refine step with PBR textures...');
      
      // 3. Start the refine job with PBR textures
      const refineResponse = await fetch(MESHY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
        // Log full error details internally
        console.error('Meshy API refine error response:', errorText);
        // Return sanitized error to client
        throw new Error(sanitizeErrorMessage(`Meshy API refine error: ${refineResponse.status} ${refineResponse.statusText}`));
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
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        console.log('Meshy refine status response status:', refineStatusResponse.status);
        
        if (!refineStatusResponse.ok) {
          const errorText = await refineStatusResponse.text();
          // Log full error details internally
          console.error('Meshy API refine status error response:', errorText);
          // Return sanitized error to client
          throw new Error(sanitizeErrorMessage(`Meshy API refine status error: ${refineStatusResponse.status} ${refineStatusResponse.statusText}`));
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
          isPBR: true,
          hasImagePrompt: !!options.imagePrompt
        },
        textureUrls: refineResultData.texture_urls || [],
        measurements: computeMeasurements(refineResultData)
      };
    } else {
      // If enablePBR is false, return the preview model
      let modelUrl;
      
      // Extract model URL based on provider - they have different response formats
      if (providerName === 'hunyuan') {
        // Hunyuan stores the URL in asset_url_glb
        modelUrl = previewData.asset_url_glb;
      } else {
        // Meshy stores URLs in model_urls.glb
        modelUrl = previewData.model_urls?.glb;
      }
      
      if (!modelUrl) {
        console.error(`No model URL found in ${providerName} response:`, previewData);
        throw new Error(`No model URL found in the ${providerName === 'hunyuan' ? 'Hunyuan' : 'Meshy'} API response`);
      }
      
      console.log(`Successfully generated ${providerName} model with URL:`, modelUrl);
      
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
          isPBR: false,
          hasImagePrompt: !!options.imagePrompt
        },
        measurements: computeMeasurements(previewData)
      };
    }
  } catch (error) {
    console.error('Error generating model:', error);
    // Add more context to the error for better debugging
    const enhancedError = new Error(
      sanitizeErrorMessage(`Failed to generate model: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

    // Get the provider from the request body or fallback to env setting
    const providerName = body.provider || process.env.GEN_PROVIDER || 'meshy';

    // Log which provider is being used (for debugging)
    console.info('[Gen3D] using provider:', providerName);

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
      provider: providerName
    };

    // Safe debug logging that doesn't expose full keys
    if (process.env.DEBUG_PROVIDERS === 'true') {
      try {
        // Check keys through secure provider
        const results = await verifyApiKeys();
        console.info('[Gen3D] Environment variables check:');
        console.info('- MESHY_KEY:', results.meshy ? 'Set (starts with: your_mes...)' : 'Not set');
        console.info('- HY3D_KEY:', results.hunyuan ? 'Set (starts with: hunyuan_...)' : 'Not set');
        console.info('- GEN_PROVIDER:', process.env.GEN_PROVIDER || 'Not set');
        
        if (results.errors && results.errors.length > 0) {
          console.warn('[Gen3D] Key validation warnings:', results.errors);
        }
      } catch (error) {
        console.error('[Gen3D] Error validating API keys:', error);
      }
    }
    
    // Get the appropriate provider
    const provider = getProvider(providerName);
    
    // If provider selection is 'hunyuan' but we're still using Meshy, log a warning
    if (providerName === 'hunyuan' && provider.constructor.name !== 'HunyuanProvider') {
      console.warn('[Gen3D] Warning: Requested Hunyuan provider but got', provider.constructor.name);
    }
    
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
} catch (err) {
    // ⬇︎ Add these three lines
    console.error('[generate] fatal error', err);
    return NextResponse.json(
      { ok: false, message: (err as Error).message, stack: (err as Error).stack },
      { status: 500 }
    );
  }
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