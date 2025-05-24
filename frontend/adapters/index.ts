// Register all providers with the factory
import { registerProvider } from '../lib/gen3d/ProviderFactory';
import { HunyuanProvider } from './HunyuanProvider';
import { MeshyProvider } from './MeshyProvider';

// Register the providers
registerProvider('hunyuan', () => new HunyuanProvider());
registerProvider('meshy', () => new MeshyProvider());

console.log('[Providers] Meshy & Hunyuan registered successfully');