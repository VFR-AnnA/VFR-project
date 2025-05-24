/**
 * Feature flags configuration
 * 
 * This file contains all feature flags used in the application.
 * Feature flags allow for controlled rollout of features and easy disabling if needed.
 */

interface FeatureFlags {
  /**
   * Enable PBR textures in the refine step
   * When enabled, models will be generated with high-quality PBR textures
   * When disabled, only preview models (clay-mesh) will be generated
   */
  REFINE_PBR: boolean;
  
  /**
   * Enable CDN caching for generated models
   * When enabled, models will be copied to a CDN for faster access
   */
  CDN_CACHING: boolean;
  
  /**
   * Enable credit tracking in admin panel
   * When enabled, credit usage will be tracked per user/IP
   */
  CREDIT_TRACKING: boolean;
}

/**
 * Feature flags for different environments
 */
const featureFlags: Record<string, FeatureFlags> = {
  // Development environment
  development: {
    REFINE_PBR: true,
    CDN_CACHING: false,
    CREDIT_TRACKING: false
  },
  
  // Production environment
  production: {
    REFINE_PBR: true, // Enabled in production as requested
    CDN_CACHING: false, // Not yet implemented
    CREDIT_TRACKING: false // Not yet implemented
  },
  
  // Test environment
  test: {
    REFINE_PBR: true,
    CDN_CACHING: false,
    CREDIT_TRACKING: false
  }
};

/**
 * Get the current environment
 */
const getEnvironment = (): string => {
  return process.env.NODE_ENV || 'development';
};

/**
 * Get feature flags for the current environment
 */
export const getFeatureFlags = (): FeatureFlags => {
  const env = getEnvironment();
  return featureFlags[env] || featureFlags.development;
};

/**
 * Check if a feature flag is enabled
 * @param flag The feature flag to check
 */
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  return flags[flag] || false;
};