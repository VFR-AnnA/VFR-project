const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(source, target) {
  // Create target folder if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(file => {
      const curSource = path.join(source, file);
      const curTarget = path.join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
      }
    });
  }
}

// Copy models to models-draco
const source = path.join(__dirname, '..', 'public', 'models');
const target = path.join(__dirname, '..', 'public', 'models-draco');

console.log(`Copying models from ${source} to ${target}...`);
copyFolderRecursiveSync(source, target);
console.log('Models copied successfully!');
