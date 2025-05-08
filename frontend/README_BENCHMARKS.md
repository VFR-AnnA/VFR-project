# Performance Benchmarks

This document provides instructions for benchmarking the performance of the VFR application.

## Asset Size

The goal is to achieve a file size of less than 150 KB for each model.

### Measurement

1. Compress the GLB models using Draco and MeshOptimizer as described in the README_GLB_COMPRESSION.md file.
2. Record the file sizes in the compress_logs.csv file.
3. Verify that each model is less than 150 KB.

## Viewer FPS

The goal is to achieve a frame rate of at least 45 FPS on a laptop.

### Measurement

1. Set up the WebGPU renderer as described in the README_WEBGPU.md file.
2. Add the Stats.js panel or log the FPS to the console.
3. Record the FPS measurements in this file.

### Results

| Browser | Renderer | FPS | Notes |
|---------|----------|-----|-------|
| Chrome 118 | WebGPU | ? | |
| Edge | WebGL | ? | |

## Edge TTFVF

The goal is to achieve a Time To First Visual Frame (TTFVF) of less than 600 ms.

### Measurement

1. Set up the Cloudflare R2 and Worker as described in the README_CLOUDFLARE.md file.
2. Run Lighthouse to measure the TTFVF:

```bash
lighthouse --preset=experimental https://your-worker-endpoint.workers.dev/index.html --output=csv --output-path=docs/perf/run_edge.csv
```

3. Record the TTFVF measurements in this file.

### Results

| Run | TTFVF (ms) | Notes |
|-----|------------|-------|
| 1 | ? | |
| 2 | ? | |
| 3 | ? | |

## Cost per SKU

The goal is to achieve a cost of less than €0.30 per SKU.

### Calculation

The cost per SKU is calculated as follows:

```
Cost per SKU = (GPU-minutes * €tariff + storage) / SKU
```

Where:
- GPU-minutes is the time taken to compress the model in minutes
- €tariff is the cost per GPU-minute
- storage is the cost of storing the model in R2

### Results

| SKU | GPU-minutes | Storage (KB) | Cost (€) |
|-----|-------------|--------------|----------|
| mannequin.glb | ? | 270.44 | ? |

## Legal Hash

The SHA-256 hash of the i-Depot ZIP file is included in the source code as a reference.

### Verification

1. Calculate the SHA-256 hash of the i-Depot ZIP file:

```bash
sha256sum i-depot.zip
```

2. Verify that the hash matches the one in the source code.

### Results

| File | SHA-256 Hash |
|------|--------------|
| i-depot.zip | 3dd4…ab9c |