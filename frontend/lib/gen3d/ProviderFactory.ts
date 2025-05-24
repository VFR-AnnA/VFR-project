import type { Gen3DProvider } from './types';

type ProviderCreator = () => Gen3DProvider;

/**
 * Registry of available 3D generation providers
 */
const providers: Record<string, ProviderCreator> = {};

/**
 * Register a 3D generation provider
 * @param name Name of the provider
 * @param creator Function to create a provider instance
 */
export function registerProvider(name: string, creator: ProviderCreator): void {
  providers[name] = creator;
}

/**
 * Create a provider instance by name
 * @param name Name of the provider
 * @returns Provider instance
 * @throws Error if provider is not registered
 */
export function createProvider(name: string): Gen3DProvider {
  const creator = providers[name];
  if (!creator) {
    throw new Error(`Provider "${name}" is not registered`);
  }
  return creator();
}

/**
 * Get the default provider based on environment configuration
 * @returns Provider instance
 * @throws Error if default provider is not configured or not registered
 */
export function getDefaultProvider(): Gen3DProvider {
  const providerName = process.env.GEN_PROVIDER;
  if (!providerName) {
    throw new Error('Default provider not configured. Set GEN_PROVIDER environment variable.');
  }
  return createProvider(providerName);
}

/**
 * Get names of all registered providers
 * @returns Array of provider names
 */
export function getProviderNames(): string[] {
  return Object.keys(providers);
}