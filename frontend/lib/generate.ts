import { generateSpar3d } from './ai/spar3d';
import useGeneratorSettingsStore from '../app/hooks/useGeneratorSettingsStore';

/**
 * Generate a 3D model using the selected provider
 *
 * @param opts Options for generation
 * @returns Promise with the generated model URL
 */
export async function generateModel(opts: { image: File; prompt?: string }) {
  const { provider } = useGeneratorSettingsStore.getState();
  
  // If SPAR3D is selected, always use image-to-3D
  if (provider === 'spar3d') {
    if (!opts.image) {
      throw new Error('Image is required for SPAR3D generation');
    }
    return generateSpar3d(opts.image, opts.prompt ?? 'Generated from image');
  }
  
  // For other providers, use their respective APIs
  // This would be expanded to handle Meshy, Hunyuan, etc.
  
  // Default fallback
  throw new Error(`Provider ${provider} not implemented or not selected`);
}