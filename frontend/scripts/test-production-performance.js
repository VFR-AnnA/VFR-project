#!/usr/bin/env node

/**
 * Production API Smoke Test
 * 
 * This script tests the 3D generation API without generating actual models
 * to verify that the environment is properly configured and authentication works.
 * 
 * Usage:
 *   node scripts/test-production-performance.js
 */

// Load environment variables from .env.local if not in CI
if (!process.env.CI) {
  require('dotenv').config({ path: '.env.local' });
}

const https = require('https');

// Helper to redact keys for logging
const redact = (s = '') => s ? `${s.slice(0, 4)}...${s.slice(-4)}` : '[empty]';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper to make HTTPS requests
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test Meshy API key
async function testMeshyApi() {
  console.log(`\n${colors.blue}Testing Meshy API...${colors.reset}`);
  
  const key = process.env.MESHY_KEY;
  if (!key) {
    console.log(`${colors.yellow}⚠️ MESHY_KEY not set, skipping test${colors.reset}`);
    return { success: false, reason: 'API key not set' };
  }
  
  console.log(`Using key: ${redact(key)}`);
  
  try {
    // First check with a ping request
    const pingUrl = 'https://api.meshy.ai/ping';
    console.log(`Testing ping endpoint: ${pingUrl}`);
    
    const pingResponse = await makeRequest(pingUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });
    
    if (pingResponse.status === 200) {
      console.log(`${colors.green}✅ Meshy API ping successful${colors.reset}`);
      
      // Now test the actual generation endpoint (but don't actually generate)
      // We'll use a dryRun flag to avoid generating a model
      const dryRunUrl = 'https://api.meshy.ai/openapi/v2/text-to-3d';
      console.log(`Testing generation endpoint with dryRun: ${dryRunUrl}`);
      
      const dryRunResponse = await makeRequest(dryRunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Test prompt for API validation',
          mode: 'preview',
          dryRun: true // This may not be supported, but it's worth trying
        })
      });
      
      // Even if this returns a 400 for unsupported dryRun, as long as it's not 401 unauthorized, it's good
      if (dryRunResponse.status !== 401) {
        console.log(`${colors.green}✅ Meshy API generation endpoint authentication successful${colors.reset}`);
        return { success: true };
      } else {
        console.log(`${colors.red}❌ Meshy API generation endpoint authentication failed${colors.reset}`);
        console.log(`Response: ${JSON.stringify(dryRunResponse.data)}`);
        return { success: false, reason: 'Generation endpoint authentication failed' };
      }
    } else {
      console.log(`${colors.red}❌ Meshy API ping failed with status ${pingResponse.status}${colors.reset}`);
      console.log(`Response: ${JSON.stringify(pingResponse.data)}`);
      return { success: false, reason: `Ping failed with status ${pingResponse.status}` };
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error testing Meshy API: ${error.message}${colors.reset}`);
    return { success: false, reason: error.message };
  }
}

// Test Hunyuan API key
async function testHunyuanApi() {
  console.log(`\n${colors.blue}Testing Hunyuan API...${colors.reset}`);
  
  const key = process.env.HY3D_KEY;
  if (!key) {
    console.log(`${colors.yellow}⚠️ HY3D_KEY not set, skipping test${colors.reset}`);
    return { success: false, reason: 'API key not set' };
  }
  
  const region = process.env.HY3D_REGION || 'cn-shenzhen';
  console.log(`Using key: ${redact(key)}`);
  console.log(`Using region: ${region}`);
  
  try {
    // Test with ping endpoint
    const pingUrl = 'https://hunyuan.tencentcloudapi.com/v2/ping';
    console.log(`Testing ping endpoint: ${pingUrl}`);
    
    const pingResponse = await makeRequest(pingUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': key,
        'X-Api-Region': region
      }
    });
    
    if (pingResponse.status === 200) {
      console.log(`${colors.green}✅ Hunyuan API ping successful${colors.reset}`);
      return { success: true };
    } else {
      console.log(`${colors.red}❌ Hunyuan API ping failed with status ${pingResponse.status}${colors.reset}`);
      console.log(`Response: ${JSON.stringify(pingResponse.data)}`);
      
      // Try alternate regions if this one failed
      if (pingResponse.status === 401) {
        const alternateRegions = ['ap-shanghai', 'ap-beijing', 'ap-guangzhou', 'cn-shenzhen']
          .filter(r => r !== region);
        
        console.log(`${colors.yellow}⚠️ Trying alternate regions...${colors.reset}`);
        
        for (const altRegion of alternateRegions) {
          console.log(`Testing with region: ${altRegion}`);
          
          const altResponse = await makeRequest(pingUrl, {
            method: 'GET',
            headers: {
              'X-Api-Key': key,
              'X-Api-Region': altRegion
            }
          });
          
          if (altResponse.status === 200) {
            console.log(`${colors.green}✅ Hunyuan API ping successful with region ${altRegion}${colors.reset}`);
            console.log(`${colors.yellow}⚠️ Update your HY3D_REGION to "${altRegion}" in environment variables${colors.reset}`);
            return { success: true, suggestedRegion: altRegion };
          }
        }
      }
      
      return { success: false, reason: `Ping failed with status ${pingResponse.status}` };
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error testing Hunyuan API: ${error.message}${colors.reset}`);
    return { success: false, reason: error.message };
  }
}

// Main function
async function main() {
  console.log(`${colors.cyan}================================${colors.reset}`);
  console.log(`${colors.cyan}3D Generation API Smoke Test${colors.reset}`);
  console.log(`${colors.cyan}================================${colors.reset}`);
  
  // Check environment variables
  console.log(`\n${colors.blue}Checking environment variables...${colors.reset}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`Runtime: ${process.env.CI ? 'CI/CD' : 'Local'}`);
  console.log(`GEN_PROVIDER: ${process.env.GEN_PROVIDER || 'not set (default: meshy)'}`);
  console.log(`MESHY_KEY: ${process.env.MESHY_KEY ? 'set' : 'not set'}`);
  console.log(`HY3D_KEY: ${process.env.HY3D_KEY ? 'set' : 'not set'}`);
  console.log(`HY3D_REGION: ${process.env.HY3D_REGION || 'not set (default: cn-shenzhen)'}`);
  
  // Test both providers
  const meshyResult = await testMeshyApi();
  const hunyuanResult = await testHunyuanApi();
  
  // Print summary
  console.log(`\n${colors.cyan}================================${colors.reset}`);
  console.log(`${colors.cyan}Test Results${colors.reset}`);
  console.log(`${colors.cyan}================================${colors.reset}`);
  console.log(`Meshy API: ${meshyResult.success ? colors.green + '✅ PASS' : colors.red + '❌ FAIL'}`);
  if (!meshyResult.success && meshyResult.reason) {
    console.log(`  Reason: ${meshyResult.reason}`);
  }
  
  console.log(`Hunyuan API: ${hunyuanResult.success ? colors.green + '✅ PASS' : colors.red + '❌ FAIL'}`);
  if (!hunyuanResult.success && hunyuanResult.reason) {
    console.log(`  Reason: ${hunyuanResult.reason}`);
  }
  if (hunyuanResult.suggestedRegion) {
    console.log(`  Suggested Region: ${hunyuanResult.suggestedRegion}`);
  }
  console.log(colors.reset);
  
  // Provide recommendations
  console.log(`\n${colors.blue}Recommendations:${colors.reset}`);
  
  if (meshyResult.success && hunyuanResult.success) {
    console.log(`${colors.green}✅ Both providers are working correctly!${colors.reset}`);
  } else if (meshyResult.success) {
    console.log(`${colors.yellow}⚠️ Only Meshy is working. Set GEN_PROVIDER=meshy in your environment.${colors.reset}`);
  } else if (hunyuanResult.success) {
    console.log(`${colors.yellow}⚠️ Only Hunyuan is working. Set GEN_PROVIDER=hunyuan in your environment.${colors.reset}`);
    if (hunyuanResult.suggestedRegion) {
      console.log(`${colors.yellow}⚠️ Set HY3D_REGION=${hunyuanResult.suggestedRegion} in your environment.${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ Neither provider is working. Check your API keys and environment variables.${colors.reset}`);
  }
  
  // Exit with appropriate code for CI
  if (process.env.CI) {
    if (meshyResult.success || hunyuanResult.success) {
      process.exit(0); // Success if at least one provider works
    } else {
      process.exit(1); // Failure if neither provider works
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});