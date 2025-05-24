#!/usr/bin/env node

/**
 * Smoke test for API keys
 * This script verifies that the API keys are correctly formatted and can authenticate with the services.
 * Run with: node scripts/smoke-test-keys.js
 */

const https = require('https');

// Helper to redact keys for logging
const redact = (s = '') => s ? `${s.slice(0, 4)}...${s.slice(-4)}` : '[empty]';

// Helper to make HTTPS requests
async function makeRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'GET', headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

// Verify Meshy key
async function testMeshyKey() {
  console.log('\n🔑 Testing MESHY_KEY...');
  
  const key = process.env.MESHY_KEY;
  if (!key) {
    console.error('❌ MESHY_KEY is not set in environment variables');
    return false;
  }
  
  console.log(`Key found: ${redact(key)}`);
  
  // Check for common issues
  if (key.includes('\n') || key.includes('\r')) {
    console.warn('⚠️ Warning: Key contains newline characters which may cause authentication failures');
  }
  
  if (key.trim() !== key) {
    console.warn('⚠️ Warning: Key contains leading/trailing whitespace which may cause authentication failures');
  }
  
  // Verify against Meshy API
  try {
    const url = 'https://api.meshy.ai/ping';
    console.log(`Testing against ${url}...`);
    
    const response = await makeRequest(url, {
      'Authorization': `Bearer ${key}`
    });
    
    if (response.status === 200) {
      console.log('✅ Success! MESHY_KEY is valid');
      return true;
    } else {
      console.error(`❌ Error: HTTP ${response.status}`);
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing MESHY_KEY:', error.message);
    return false;
  }
}

// Verify Hunyuan key
async function testHunyuanKey() {
  console.log('\n🔑 Testing HY3D_KEY...');
  
  const key = process.env.HY3D_KEY;
  if (!key) {
    console.error('❌ HY3D_KEY is not set in environment variables');
    return false;
  }
  
  console.log(`Key found: ${redact(key)}`);
  
  // Check for common issues
  if (key.includes('\n') || key.includes('\r')) {
    console.warn('⚠️ Warning: Key contains newline characters which may cause authentication failures');
  }
  
  if (key.trim() !== key) {
    console.warn('⚠️ Warning: Key contains leading/trailing whitespace which may cause authentication failures');
  }
  
  // Get region for testing
  const region = process.env.HY3D_REGION || 'cn-shenzhen';
  console.log(`Using region: ${region}`);
  
  // Verify against Hunyuan API
  try {
    // Using a basic ping endpoint - adjust if needed
    const url = 'https://api.hunyuan.tencentcloudapi.com/v2/ping';
    console.log(`Testing against ${url}...`);
    
    const response = await makeRequest(url, {
      'X-Api-Key': key,
      'X-Api-Region': region
    });
    
    if (response.status === 200) {
      console.log('✅ Success! HY3D_KEY is valid');
      return true;
    } else if (response.status === 401) {
      // Try alternate regions
      const alternateRegions = ['ap-shanghai', 'ap-beijing', 'ap-guangzhou'];
      console.log('⚠️ Authentication failed with current region. Trying alternate regions...');
      
      for (const altRegion of alternateRegions) {
        if (altRegion === region) continue;
        
        console.log(`Trying region: ${altRegion}...`);
        const altResponse = await makeRequest(url, {
          'X-Api-Key': key,
          'X-Api-Region': altRegion
        });
        
        if (altResponse.status === 200) {
          console.log(`✅ Success with region ${altRegion}! Update your HY3D_REGION environment variable.`);
          return true;
        }
      }
      
      console.error('❌ Error: Invalid API key or region');
      console.error('Response:', response.data);
      return false;
    } else {
      console.error(`❌ Error: HTTP ${response.status}`);
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing HY3D_KEY:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔍 API Key Smoke Test');
  console.log('====================');
  
  const meshyResult = await testMeshyKey();
  const hunyuanResult = await testHunyuanKey();
  
  console.log('\n📊 Test Results:');
  console.log(`MESHY_KEY: ${meshyResult ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`HY3D_KEY: ${hunyuanResult ? '✅ Valid' : '❌ Invalid'}`);
  
  if (!meshyResult && !hunyuanResult) {
    console.log('\n❌ Both keys failed validation. Check your environment variables and API key values.');
    process.exit(1);
  }
  
  if (!meshyResult) {
    console.log('\n⚠️ MESHY_KEY failed validation but HY3D_KEY is valid.');
    console.log('Consider setting GEN_PROVIDER=hunyuan in your environment to use the working provider.');
  }
  
  if (!hunyuanResult) {
    console.log('\n⚠️ HY3D_KEY failed validation but MESHY_KEY is valid.');
    console.log('Consider setting GEN_PROVIDER=meshy in your environment to use the working provider.');
  }
  
  if (meshyResult && hunyuanResult) {
    console.log('\n✅ All keys are valid!');
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});