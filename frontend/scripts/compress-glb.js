#!/usr/bin/env node

/**
 * GLB Compression Script
 * Compresses GLB files using Draco compression to reduce file size by 65-85%
 * 
 * Usage: node scripts/compress-glb.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLOTHES_DIR = path.join(__dirname, '../public/models/clothes');
const MODELS_TO_COMPRESS = ['hoodie.glb', 'tshirt.glb'];

console.log('🗜️  GLB Compression Script');
console.log('========================\n');

// Check if gltf-pipeline is installed
try {
  execSync('npx gltf-pipeline --help', { stdio: 'ignore' });
} catch (error) {
  console.log('📦 Installing gltf-pipeline...');
  execSync('npm install -g gltf-pipeline', { stdio: 'inherit' });
}

// Ensure clothes directory exists
if (!fs.existsSync(CLOTHES_DIR)) {
  console.log(`❌ Clothes directory not found: ${CLOTHES_DIR}`);
  console.log('Please add your GLB files to public/models/clothes/ first.');
  process.exit(1);
}

// Compress each model
MODELS_TO_COMPRESS.forEach(filename => {
  const inputPath = path.join(CLOTHES_DIR, filename);
  const outputPath = path.join(CLOTHES_DIR, filename.replace('.glb', '-draco.glb'));
  
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skipping ${filename} - file not found`);
    return;
  }
  
  console.log(`\n📄 Processing ${filename}...`);
  
  try {
    // Get original file size
    const originalSize = fs.statSync(inputPath).size;
    console.log(`   Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Compress with Draco
    console.log('   Compressing with Draco...');
    execSync(`npx gltf-pipeline -i "${inputPath}" -o "${outputPath}" -d`, { stdio: 'inherit' });
    
    // Get compressed file size
    const compressedSize = fs.statSync(outputPath).size;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log(`   Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ✅ Size reduced by ${reduction}%`);
    
  } catch (error) {
    console.error(`   ❌ Error compressing ${filename}:`, error.message);
  }
});

console.log('\n✨ Compression complete!');
console.log('\nTo use compressed models, update ClothingManager.js:');
console.log(`
const CLOTHES = {
  none: null,
  hoodie: '/models/clothes/hoodie-draco.glb',
  tshirt: '/models/clothes/tshirt-draco.glb'
};
`);