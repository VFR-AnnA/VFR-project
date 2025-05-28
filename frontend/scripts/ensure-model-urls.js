/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-21T14:07+02:00
 * 
 * This script ensures that the correct URLs are used for the 3D models
 * It runs during the build process to verify and update model paths if needed
 */

const fs = require('fs');
const path = require('path');

// Define the correct model paths
const CORRECT_PATHS = {
  STUB: '/models-draco/mannequin-stub.glb',
  DRACO: '/models-draco/mannequin.glb',
  REALISTIC_STUB: '/models-draco/mannequin-stub.glb', // Update this when real model is available
  REALISTIC_DRACO: '/models-draco/mannequin.glb', // Update this when real model is available
};

// Files to check and update
const FILES_TO_CHECK = [
  'app/components/RealisticAvatar.tsx',
  'app/components/VFRViewer.tsx',
  'app/components/SimpleVFRViewer.tsx'
];

// Function to check and update model paths in a file
function updateModelPaths(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;
  
  // Check for model path constants
  const modelPathRegex = /const\s+MODELS\s*=\s*{[^}]*}/s;
  if (modelPathRegex.test(content)) {
    // Extract the MODELS object
    const modelsMatch = content.match(modelPathRegex);
    if (modelsMatch) {
      let modelsObject = modelsMatch[0];
      
      // Check and update each path
      Object.entries(CORRECT_PATHS).forEach(([key, correctPath]) => {
        const pathRegex = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`, 'g');
        const match = pathRegex.exec(modelsObject);
        
        if (match && match[1] !== correctPath) {
          console.log(`Updating ${key} path in ${filePath} from "${match[1]}" to "${correctPath}"`);
          modelsObject = modelsObject.replace(
            `${key}: '${match[1]}'`,
            `${key}: '${correctPath}'`
          ).replace(
            `${key}: "${match[1]}"`,
            `${key}: "${correctPath}"`
          );
          updated = true;
        }
      });
      
      // Replace the MODELS object in the content
      if (updated) {
        content = content.replace(modelPathRegex, modelsObject);
      }
    }
  }
  
  // Check for individual model path references
  Object.entries(CORRECT_PATHS).forEach(([key, correctPath]) => {
    // Look for direct path references like stubUrl={`${MODELS_PATH}/mannequin-stub.glb`}
    const directPathRegex = new RegExp(`\\$\\{MODELS_PATH\\}/[^}]+\\.glb`, 'g');
    let match;
    
    while ((match = directPathRegex.exec(content)) !== null) {
      const foundPath = match[0];
      const fileName = path.basename(foundPath.replace('${MODELS_PATH}/', ''));
      
      // Check if this is a path we should update
      const shouldUpdate = Object.values(CORRECT_PATHS).some(correctPath => 
        correctPath.endsWith(fileName)
      );
      
      if (shouldUpdate) {
        const correctFileName = path.basename(correctPath);
        const updatedPath = '${MODELS_PATH}/' + correctFileName;
        
        if (foundPath !== updatedPath) {
          console.log(`Updating direct path in ${filePath} from "${foundPath}" to "${updatedPath}"`);
          content = content.replace(foundPath, updatedPath);
          updated = true;
        }
      }
    }
  });
  
  // Write the updated content back to the file if changes were made
  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated model paths in ${filePath}`);
    return true;
  } else {
    console.log(`No updates needed for ${filePath}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Checking and updating model paths...');
  
  let updatedCount = 0;
  
  FILES_TO_CHECK.forEach(filePath => {
    if (updateModelPaths(filePath)) {
      updatedCount++;
    }
  });
  
  if (updatedCount > 0) {
    console.log(`Updated model paths in ${updatedCount} files.`);
  } else {
    console.log('All model paths are correct.');
  }
}

// Run the script
main();