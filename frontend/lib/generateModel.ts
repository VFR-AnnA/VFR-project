import { useGenerator } from './store/generatorStore';

/**
 * Helper function to build FormData for image uploads
 */
function buildFormData({ image, text }: { image: File; text?: string }): FormData {
  const formData = new FormData();
  formData.append('image', image);
  if (text) {
    formData.append('text', text);
  }
  return formData;
}

/**
 * Generates a 3D model using either SPAR3D (for image inputs) or Meshy (for text inputs)
 * automatically selecting the appropriate provider based on whether an image is provided
 * 
 * @returns Promise resolving to the API response with model URL or ID
 */
export async function generateModel() {
  const { imageFile, text } = useGenerator.getState();

  console.log('generateModel called with:', {
    hasImageFile: !!imageFile,
    imageFileSize: imageFile?.size,
    textLength: text?.length,
    text: text
  });

  const wantsImage = !!imageFile;
  const provider = wantsImage ? 'spar3d' : 'meshy';
  const url = wantsImage ? '/api/local/generate'
                        : '/api/meshy/text-to-3d';

  console.log('Using provider:', provider, 'with URL:', url);

  const body = wantsImage
    ? buildFormData({ image: imageFile!, text })
    : JSON.stringify({ prompt: text });

  try {
    console.log('Sending request to:', url);
    const res = await fetch(url, {
      method: 'POST',
      body: body,
      headers: wantsImage ? {} : { 'Content-Type': 'application/json' }
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API error response:', errorText);
      throw new Error(`API error ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('API response data:', data);
    return data;                // contains model URL or ID
  } catch (err) {
    console.error('Error in generateModel:', err);
    throw err;
  }
}