/**
 * SecureKeyProvider
 *
 * Centralizes secure access to API keys for 3D generation providers.
 * Keys are only accessible from server-side code and never exposed to the client.
 */

/**
 * Keys supported by the secure provider
 */
export type SecureKeyType = 'MESHY_KEY' | 'HY3D_KEY';

/**
 * Safely redact a string to show only first 4 and last 4 chars
 * @param str String to redact
 * @returns Redacted string
 */
export function redactKey(str: string = ''): string {
  if (!str) return '[empty]';
  if (str.length <= 8) return '*'.repeat(str.length);
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

/**
 * Get a secure API key
 * @param keyType Type of key to retrieve
 * @param showDebugInfo Whether to log debug info
 * @returns The API key
 * @throws Error if key is not available
 */
export function getSecureKey(keyType: SecureKeyType, showDebugInfo = false): string {
  const key = process.env[keyType];
  
  if (!key) {
    console.error(`[SecureKeyProvider] Error: ${keyType} is not set in environment variables`);
    throw new Error(`Required API key ${keyType} is not set in environment variables`);
  }
  
  if (showDebugInfo) {
    console.log(`[SecureKeyProvider] Using ${keyType}: ${redactKey(key)}`);
  }
  
  // Check for common issues with keys
  if (key.includes('\n') || key.includes('\r') || key.trim() !== key) {
    console.warn(`[SecureKeyProvider] Warning: ${keyType} contains whitespace or newlines which may cause API errors`);
  }
  
  return key;
}

/**
 * Verify if all required keys are properly configured
 * Useful for CI to fail early if keys are missing
 * @param dryRun If true, only validates keys exist but doesn't use them
 * @returns Object containing validation results
 */
export async function verifyApiKeys(dryRun = false): Promise<{
  meshy: boolean;
  hunyuan: boolean;
  errors?: string[];
}> {
  const errors: string[] = [];
  let meshyValid = false;
  let hunyuanValid = false;
  
  // Check if keys exist
  try {
    const meshyKey = getSecureKey('MESHY_KEY');
    meshyValid = meshyKey.length > 0;
    
    // Do a basic format validation if not in dry-run mode
    if (!dryRun && !meshyKey.startsWith('msy_')) {
      errors.push('MESHY_KEY format appears invalid (should start with msy_)');
      meshyValid = false;
    }
  } catch (e) {
    errors.push(`MESHY_KEY error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  try {
    const hyKey = getSecureKey('HY3D_KEY');
    hunyuanValid = hyKey.length > 0;
    
    // Do a basic format validation if not in dry-run mode
    if (!dryRun && !hyKey.startsWith('hy_') && !hyKey.startsWith('hunyuan_')) {
      errors.push('HY3D_KEY format appears invalid (should start with hy_ or hunyuan_)');
      hunyuanValid = false;
    }
  } catch (e) {
    errors.push(`HY3D_KEY error: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  return {
    meshy: meshyValid,
    hunyuan: hunyuanValid,
    ...(errors.length > 0 && { errors })
  };
}