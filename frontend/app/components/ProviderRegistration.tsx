'use client';

import { registerProvider } from '../../lib/gen3d/ProviderFactory';
import { MeshyProvider } from '../../adapters/MeshyProvider';
import { HunyuanProvider } from '../../adapters/HunyuanProvider';

// Register all providers here
registerProvider('meshy', () => new MeshyProvider());
registerProvider('hunyuan', () => new HunyuanProvider());

console.log('[ProviderReg] Meshy & Hunyuan registered');

// This component renders nothing – it only triggers the imports
export default function ProviderRegistration() { 
  return null; 
}