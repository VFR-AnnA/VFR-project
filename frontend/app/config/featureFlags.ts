// Feature flags for the VFR project
// These flags control which experimental features are enabled

/**
 * Controls whether the experimental WebGPU cloth drape solver is enabled
 * Set to 'true' in .env file to enable the feature
 */
export const ENABLE_DRAPE = process.env.NEXT_PUBLIC_ENABLE_DRAPE === 'true';

// Add other feature flags below