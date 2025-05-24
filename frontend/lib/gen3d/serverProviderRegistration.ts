/**
 * Server-side provider registration
 * This file is imported directly in server routes to ensure providers are registered
 */

import { registerProvider } from './ProviderFactory';
import { MeshyProvider } from '../../adapters/MeshyProvider';
import { HunyuanProvider } from '../../adapters/HunyuanProvider';

// Register all providers for server-side code
registerProvider('meshy', () => new MeshyProvider());
registerProvider('hunyuan', () => new HunyuanProvider());

console.log('[Server ProviderReg] Meshy & Hunyuan registered');