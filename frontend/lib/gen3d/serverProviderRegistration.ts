/**
 * Server-side provider registration
 * This file is imported directly in server routes to ensure providers are registered
 */

import { registerProvider } from './ProviderFactory';
import { MeshyProvider } from '../../adapters/MeshyProvider';
import { HunyuanProvider } from '../../adapters/HunyuanProvider';
import { Spar3dProvider } from '../../adapters/Spar3dProvider';

// Register all providers for server-side code
registerProvider('meshy', () => new MeshyProvider());
registerProvider('hunyuan', () => new HunyuanProvider());
registerProvider('spar3d', () => new Spar3dProvider());

console.log('[Server ProviderReg] Meshy, Hunyuan & SPAR3D registered');