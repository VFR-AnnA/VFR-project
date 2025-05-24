/**
 * API Key Validation Tests
 * 
 * These tests verify that API keys for 3D generation services are correctly configured
 * without actually generating models or incurring costs.
 */

import { verifyApiKeys } from '../lib/gen3d/SecureKeyProvider';

describe('3D Generation API Keys', () => {
  test('API keys are properly configured', async () => {
    // Verify all required API keys are set without making real API calls
    const results = await verifyApiKeys(true); // true = dry run
    
    // Check Meshy key
    expect(results.meshy).toBe(true);
    if (!results.meshy) {
      console.error('MESHY_KEY is missing or invalid');
    }
    
    // Check Hunyuan key
    expect(results.hunyuan).toBe(true);
    if (!results.hunyuan) {
      console.error('HY3D_KEY is missing or invalid');
    }
    
    // Additional validation errors
    if (results.errors && results.errors.length > 0) {
      console.warn('API Key validation warnings:', results.errors);
    }
  });
  
  test('API keys follow the correct format', async () => {
    // Get env vars directly for format validation
    const meshyKey = process.env.MESHY_KEY || '';
    const hy3dKey = process.env.HY3D_KEY || '';
    
    // Check Meshy key format
    if (meshyKey.length > 0) {
      expect(meshyKey.startsWith('msy_')).toBe(true);
    }
    
    // Check Hunyuan key format
    if (hy3dKey.length > 0) {
      const validPrefix = hy3dKey.startsWith('hy_') || hy3dKey.startsWith('hunyuan_');
      expect(validPrefix).toBe(true);
    }
  });
});