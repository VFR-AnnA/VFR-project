# GLB Compression

This document provides instructions for compressing GLB models using Draco and MeshOptimizer.

## Prerequisites

- Node.js installed
- @gltf-transform/cli and meshoptimizer packages installed

## Installation

Install the required packages:

```bash
npm install -D @gltf-transform/cli meshoptimizer
```

## Compression

The compression process involves two steps:

1. Draco compression: Reduces the size of the mesh data by quantizing vertex attributes.
2. MeshOptimizer: Optimizes the vertex cache and further reduces the size of the mesh data.

### Compress a Single Model

```bash
cd public/models
npx gltf-transform draco model.glb tmp.glb
npx gltf-transform meshopt tmp.glb model.glb
rm tmp.glb
```

### Compress Multiple Models

```bash
cd public/models

foreach ($n in 6..20) {
    $sku = "SKU_$n.glb"
    $t = Measure-Command {
        npx gltf-transform draco $sku tmp.glb
        npx gltf-transform meshopt tmp.glb $sku
        Remove-Item tmp.glb
    }
    "$sku,Seconds,$($t.TotalSeconds)" | Out-File ../../../compress_logs.csv -Append
}
```

## Results

The compression results are recorded in the `compress_logs.csv` file. The file contains the following information:

- Model name
- Compression time in seconds
- File size in KB

The goal is to achieve a file size of less than 150 KB for each model.

## Troubleshooting

If you encounter any issues with the compression process, try the following:

- Make sure the GLB models are valid and can be loaded by Three.js.
- Check the console for any error messages.
- Try compressing the models one by one to identify any problematic models.