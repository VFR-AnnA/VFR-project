'use client';

/**
 * Simplified Web Vitals hook that doesn't rely on the web-vitals package
 * This is a fallback for when the web-vitals package fails to load
 */
export function useWebVitals() {
  // This is a simplified version that doesn't actually measure web vitals
  // but provides the same interface as the original hook
  
  // Log that we're using the simplified version
  console.log('Using simplified Web Vitals hook (no metrics will be collected)');
  
  // Return an empty object to match the interface
  return {};
}