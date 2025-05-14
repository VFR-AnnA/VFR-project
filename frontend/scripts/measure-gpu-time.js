const { execSync } = require('child_process');
const fs = require('fs');

function measureCompressionTime(inputFile, outputFile, options = '') {
  const command = "npx gltf-transform draco " + inputFile + " " + outputFile + " " + options;
  console.log("Running: " + command);
  const start = process.hrtime();
  execSync(command, { stdio: 'inherit' });
  const end = process.hrtime(start);
  const seconds = end[0] + end[1] / 1e9;
  return seconds;
}

function main() {
  const models = [
    { name: 'Original', input: 'public/models/mannequin.glb', output: 'temp/original-draco.glb' },
    { name: 'Stub', input: 'public/models/mannequin-stub.glb', output: 'temp/stub-draco.glb' },
    { name: 'Draco', input: 'public/models/mannequin-draco.glb', output: 'temp/draco-draco.glb' },
  ];

  if (!fs.existsSync('temp')) {
    fs.mkdirSync('temp');
  }

  models.forEach(model => {
    const time = measureCompressionTime(model.input, model.output, '--encode-speed 5');
    console.log(model.name + " GPU Compression Time: " + time.toFixed(2) + " seconds");
  });
}

main();