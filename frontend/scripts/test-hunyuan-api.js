#!/usr/bin/env node

/**
 * Direct test for Hunyuan API
 * 
 * Run with: DEBUG_PROVIDERS=true node scripts/test-hunyuan-api.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const https = require('https');

// Helper function to make a request
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`\nResponse Status: ${res.statusCode}`);
        console.log(`Response Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        try {
          const parsedData = JSON.parse(responseData);
          console.log('Response Body:', JSON.stringify(parsedData, null, 2));
          resolve(parsedData);
        } catch (error) {
          console.log('Response Body (raw):', responseData);
          resolve(responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testHunyuanAPI() {
  console.log('=== Testing Hunyuan API ===');
  
  // Check environment variables
  const apiKey = process.env.HY3D_KEY;
  const region = process.env.HY3D_REGION || 'cn-shenzhen';
  
  if (!apiKey) {
    console.error('Error: HY3D_KEY not found in environment variables');
    process.exit(1);
  }
  
  console.log(`Using key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`Using region: ${region}`);
  
  // Test different header combinations
  const headerSets = [
    {
      name: 'X-Api-Key + X-Api-Region + X-TC-Version',
      headers: {
        'X-Api-Key': apiKey,
        'X-Api-Region': region,
        'X-TC-Version': '2023-11-27',
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'HY3D-KEY + HY3D-REGION + X-TC-Version',
      headers: {
        'HY3D-KEY': apiKey,
        'HY3D-REGION': region,
        'X-TC-Version': '2023-11-27',
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Authorization Bearer + X-TC-Version',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Region': region,
        'X-TC-Version': '2023-11-27',
        'Content-Type': 'application/json'
      }
    }
  ];
  
  // Try different endpoints
  const endpoints = [
    'https://hunyuan.tencentcloudapi.com/v2/generate',
    'https://hunyuan.tencentcloudapi.com/v2/text-to-3d'
  ];
  
  // Request body
  const requestBody = {
    prompt: 'Test prompt for API validation',
    mode: 'avatar',
    quality: 'high',
    embed: true
  };
  
  const requestData = JSON.stringify(requestBody);
  
  // First try the ping endpoint to validate access
  console.log('\n=== Testing ping endpoint ===');
  
  try {
    const pingOptions = {
      hostname: 'hunyuan.tencentcloudapi.com',
      port: 443,
      path: '/v2/ping',
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'X-Api-Region': region,
        'X-TC-Version': '2023-11-27',
        'Content-Type': 'application/json'
      }
    };
    
    await makeRequest(pingOptions);
  } catch (error) {
    console.error('Error testing ping endpoint:', error.message);
  }
  
  // Test each combination of headers and endpoints
  for (const endpoint of endpoints) {
    console.log(`\n=== Testing endpoint: ${endpoint} ===`);
    
    const urlParts = new URL(endpoint);
    
    for (const headerSet of headerSets) {
      console.log(`\n--- With ${headerSet.name} ---`);
      
      const options = {
        hostname: urlParts.hostname,
        port: 443,
        path: urlParts.pathname,
        method: 'POST',
        headers: headerSet.headers
      };
      
      try {
        await makeRequest(options, requestData);
      } catch (error) {
        console.error(`Error with ${headerSet.name}:`, error.message);
      }
    }
  }
}

// Run the test
testHunyuanAPI().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});