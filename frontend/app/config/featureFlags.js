/**
 * Feature flags configuration
 * 
 * This file contains all feature flags used in the application.
 * Feature flags allow for controlled rollout of features and easy disabling if needed.
 */

// Feature flags for different environments
const featureFlags = {
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
const getEnvironment = () => {
  return process.env.NODE_ENV || 'development';
};

/**
 * Get feature flags for the current environment
 */
const getFeatureFlags = () => {
  const env = getEnvironment();
  return featureFlags[env] || featureFlags.development;
};

/**
 * Check if a feature flag is enabled
 * @param {string} flag The feature flag to check
 */
const isFeatureEnabled = (flag) => {
  const flags = getFeatureFlags();
  return flags[flag] || false;
};

module.exports = {
  getFeatureFlags,
  isFeatureEnabled
};