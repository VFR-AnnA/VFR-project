import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime to ensure environment variables work correctly
export const runtime = 'nodejs';

/**
 * Handles image-based 3D model generation using SPAR3D
 * 
 * @param request The incoming request with image data
 * @returns Response with the generated model information
 */
export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const text = formData.get('text') as string | null;

    // Validate required fields
    if (!image) {
      return NextResponse.json(
        { error: 'Image is required for SPAR3D generation' },
        { status: 400 }
      );
    }

    // Log the request details
    console.log('SPAR3D generation request:', {
      imageSize: image.size,
      imageType: image.type,
      textProvided: !!text
    });

    // Prepare the form data for the SPAR3D API
    const apiFormData = new FormData();
    apiFormData.append('image', image);
    
    if (text) {
      apiFormData.append('prompt', text);
    }

    // Call the SPAR3D API
    // Note: In a real implementation, you would call the actual SPAR3D API endpoint
    // For this demo, we'll simulate a successful response
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a simulated successful response
    return NextResponse.json({
      id: `spar3d-${Date.now()}`,
      url: '/models/mannequin.glb', // Use a placeholder model URL
      format: 'glb',
      createdAt: new Date().toISOString(),
      metadata: {
        prompt: text || 'Generated from image',
        provider: 'spar3d',
        hasImagePrompt: true
      }
    });
  } catch (error) {
    console.error('SPAR3D generation error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}