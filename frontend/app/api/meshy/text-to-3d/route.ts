import { NextRequest, NextResponse } from 'next/server';
import { getSecureKey } from '../../../../lib/gen3d/SecureKeyProvider';

// Force Node.js runtime to ensure environment variables work correctly
export const runtime = 'nodejs';

// Meshy API configuration
const MESHY_URL = 'https://api.meshy.ai/openapi/v2/text-to-3d';

/**
 * Handles text-based 3D model generation using Meshy
 * 
 * @param request The incoming request with text prompt
 * @returns Response with the generated model information
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Text prompt is required for Meshy generation' },
        { status: 400 }
      );
    }

    // Log the request details
    console.log('Meshy generation request:', {
      prompt: body.prompt
    });

    // In a real implementation, we would call the Meshy API
    // For this demo, we'll simulate a successful response
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a simulated successful response
    return NextResponse.json({
      id: `meshy-${Date.now()}`,
      url: '/models/mannequin.glb', // Use a placeholder model URL
      format: 'glb',
      createdAt: new Date().toISOString(),
      metadata: {
        prompt: body.prompt,
        provider: 'meshy',
        hasImagePrompt: false
      }
    });

    /* 
    // Real implementation would look like this:
    
    // Get the Meshy API key
    const apiKey = getSecureKey('MESHY_KEY');
    
    // Prepare the request body
    const meshy_request_body = {
      mode: 'preview',
      art_style: 'realistic',
      topology: 'triangle',
      embed: false,
      prompt: body.prompt.trim(),
      inputs: [{
        type: 'text',
        data: body.prompt.trim()
      }]
    };
    
    // Call the Meshy API
    const response = await fetch(MESHY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(meshy_request_body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meshy API error response:', errorText);
      throw new Error(`Meshy API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const taskId = data.result || data.id;
    
    // In a real implementation, you would poll for completion
    // For this demo, we'll return immediately
    
    return NextResponse.json({
      id: taskId,
      url: '/api/meshy/model/' + taskId, // Proxy URL to get the model when ready
      format: 'glb',
      createdAt: new Date().toISOString(),
      metadata: {
        prompt: body.prompt,
        provider: 'meshy',
        hasImagePrompt: false
      }
    });
    */
  } catch (error) {
    console.error('Meshy generation error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}