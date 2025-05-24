/**
 * Provider factory for 3D generation
 */

import { getDefaultProvider } from '../../lib/gen3d/ProviderFactory';

/**
 * Get the appropriate provider based on the provider name
 * @param providerName The name of the provider to use
 * @returns The provider instance
 */
export function getProvider(providerName?: string) {
  // If no provider name is specified, use the default provider from environment
  if (!providerName) {
    return getDefaultProvider();
  }

  // Import the provider factory
  const { createProvider } = require('../../lib/gen3d/ProviderFactory');
  
  // Create the provider instance
  return createProvider(providerName);
}