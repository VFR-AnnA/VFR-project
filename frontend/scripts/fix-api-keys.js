#!/usr/bin/env node

/**
 * API Key Fixer
 * This script helps to identify and fix common issues with API keys
 * 
 * Common issues this script can fix:
 * - Remove whitespace, newlines, and carriage returns
 * - Check for invalid key formats
 * - Help find the correct region for Hunyuan
 * - Validate keys without making actual generation requests
 * 
 * Run with: node scripts/fix-api-keys.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');
const { execSync } = require('child_process');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

// Ask for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Main function
async function main() {
  console.log('🔧 API Key Fixer');
  console.log('===============');
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  let envVars = {};
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Found .env.local file');
    // Read the current env vars
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('='); // Rejoin in case value contains =
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });
  } else {
    console.log('⚠️ No .env.local file found. Creating one from example...');
    if (fs.existsSync(path.join(process.cwd(), '.env.local.example'))) {
      fs.copyFileSync(
        path.join(process.cwd(), '.env.local.example'),
        envPath
      );
      console.log('✅ Created .env.local from example');
    } else {
      console.log('⚠️ No .env.local.example found. Creating an empty .env.local file');
      fs.writeFileSync(envPath, '# VFR API Keys\n');
    }
  }
  
  // Check Meshy key
  let meshyKey = envVars.MESHY_KEY || '';
  console.log('\n🔑 Checking MESHY_KEY...');
  
  if (!meshyKey) {
    const shouldAdd = await confirm('MESHY_KEY not found in .env.local. Would you like to add one?');
    if (shouldAdd) {
      meshyKey = await new Promise((resolve) => {
        rl.question('Enter your Meshy API key (msy_live_...): ', (key) => {
          resolve(key.trim());
        });
      });
      envVars.MESHY_KEY = meshyKey;
    }
  } else {
    console.log(`Current MESHY_KEY: ${redact(meshyKey)}`);
    
    // Check for whitespace/newline issues
    if (meshyKey.includes('\n') || meshyKey.includes('\r') || meshyKey.trim() !== meshyKey) {
      console.log('⚠️ MESHY_KEY contains whitespace or newlines which may cause authentication failures');
      const shouldFix = await confirm('Would you like to fix this by trimming the key?');
      if (shouldFix) {
        meshyKey = meshyKey.trim();
        envVars.MESHY_KEY = meshyKey;
        console.log(`✅ Fixed MESHY_KEY: ${redact(meshyKey)}`);
      }
    }
    
    // Check key format
    if (!meshyKey.startsWith('msy_')) {
      console.log('⚠️ MESHY_KEY format appears invalid (should start with msy_)');
      console.log('This might be fine if you\'re using a test key, but production keys usually start with msy_');
    }
  }
  
  // Check Hunyuan key
  let hy3dKey = envVars.HY3D_KEY || '';
  console.log('\n🔑 Checking HY3D_KEY...');
  
  if (!hy3dKey) {
    const shouldAdd = await confirm('HY3D_KEY not found in .env.local. Would you like to add one?');
    if (shouldAdd) {
      hy3dKey = await new Promise((resolve) => {
        rl.question('Enter your Hunyuan API key (hy_live_... or hunyuan_...): ', (key) => {
          resolve(key.trim());
        });
      });
      envVars.HY3D_KEY = hy3dKey;
    }
  } else {
    console.log(`Current HY3D_KEY: ${redact(hy3dKey)}`);
    
    // Check for whitespace/newline issues
    if (hy3dKey.includes('\n') || hy3dKey.includes('\r') || hy3dKey.trim() !== hy3dKey) {
      console.log('⚠️ HY3D_KEY contains whitespace or newlines which may cause authentication failures');
      const shouldFix = await confirm('Would you like to fix this by trimming the key?');
      if (shouldFix) {
        hy3dKey = hy3dKey.trim();
        envVars.HY3D_KEY = hy3dKey;
        console.log(`✅ Fixed HY3D_KEY: ${redact(hy3dKey)}`);
      }
    }
    
    // Check key format
    if (!hy3dKey.startsWith('hy_') && !hy3dKey.startsWith('hunyuan_')) {
      console.log('⚠️ HY3D_KEY format appears invalid (should start with hy_ or hunyuan_)');
      console.log('This might be fine if you\'re using a test key, but production keys usually start with hy_ or hunyuan_');
    }
    
    // Check HY3D_REGION
    if (!envVars.HY3D_REGION) {
      console.log('⚠️ HY3D_REGION not found. Default region (cn-shenzhen) will be used.');
      const shouldAdd = await confirm('Would you like to specify a region for Hunyuan?');
      if (shouldAdd) {
        console.log('Common regions: cn-shenzhen, ap-shanghai, ap-beijing, ap-guangzhou');
        const region = await new Promise((resolve) => {
          rl.question('Enter region (default: cn-shenzhen): ', (answer) => {
            resolve(answer.trim() || 'cn-shenzhen');
          });
        });
        envVars.HY3D_REGION = region;
        console.log(`✅ Set HY3D_REGION to: ${region}`);
      }
    } else {
      console.log(`Current HY3D_REGION: ${envVars.HY3D_REGION}`);
    }
  }
  
  // Check default provider
  if (!envVars.GEN_PROVIDER) {
    console.log('\n⚠️ GEN_PROVIDER not set. Default will be used (meshy).');
    const shouldAdd = await confirm('Would you like to set the default provider?');
    if (shouldAdd) {
      const provider = await new Promise((resolve) => {
        rl.question('Enter default provider (meshy/hunyuan): ', (answer) => {
          const normalizedAnswer = answer.trim().toLowerCase();
          if (normalizedAnswer === 'hunyuan') {
            return resolve('hunyuan');
          }
          return resolve('meshy');
        });
      });
      envVars.GEN_PROVIDER = provider;
      console.log(`✅ Set GEN_PROVIDER to: ${provider}`);
    }
  } else {
    console.log(`\nCurrent GEN_PROVIDER: ${envVars.GEN_PROVIDER}`);
  }
  
  // Write changes to .env.local
  const shouldSave = await confirm('\nWould you like to save these changes to .env.local?');
  if (shouldSave) {
    let newEnvContent = '# VFR API Keys - Generated by fix-api-keys.js\n';
    
    for (const [key, value] of Object.entries(envVars)) {
      newEnvContent += `${key}=${value}\n`;
    }
    
    fs.writeFileSync(envPath, newEnvContent);
    console.log('✅ Changes saved to .env.local');
  }
  
  // Offer to validate keys
  const shouldValidate = await confirm('\nWould you like to validate the API keys by making test requests?');
  if (shouldValidate) {
    try {
      console.log('\n🔍 Running smoke test...');
      execSync('node scripts/smoke-test-keys.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Error running validation test:', error.message);
    }
  }
  
  // Offer to restart dev server
  const shouldRestart = await confirm('\nWould you like to restart the Next.js dev server to apply changes?');
  if (shouldRestart) {
    console.log('⚠️ Please restart your dev server manually using:');
    console.log('pnpm next dev');
  }
  
  console.log('\n✅ API Key Fixer completed!');
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  rl.close();
  process.exit(1);
});