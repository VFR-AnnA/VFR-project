# WebGPU Cloth Drape Experiment

This is an R&D branch for experimenting with WebGPU-based cloth simulation for the VFR project. The goal is to achieve realistic cloth draping on the mannequin model using compute shaders.

## Getting Started

1. Ensure you're on the `rnd/drape-webgpu` branch:
   ```bash
   git checkout rnd/drape-webgpu
   ```

2. Create a `.env` file with the feature flag enabled:
   ```bash
   echo "NEXT_PUBLIC_ENABLE_DRAPE=true" > .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development Guidelines

1. All experimental code should be behind the feature flag:
   ```typescript
   import { ENABLE_DRAPE } from '@/app/config/featureFlags';

   if (ENABLE_DRAPE) {
     // Experimental code here
   } else {
     // Original implementation
   }
   ```

2. Keep the mannequin model optimized (max 10k vertices with proper UVs)

3. Focus on performance - target 30 FPS on desktop and 20 FPS on mid-range mobile devices

## Running Performance Tests

To run the performance benchmarks:

```bash
# Run the benchmark script
npx ts-node scripts/bench/drape_bench.ts

# Results will be saved to bench-results/ directory
```

## Current Status

- [x] Project setup and branch creation
- [x] Feature flag implementation
- [x] Basic compute shader boilerplate
- [x] Performance benchmarking script
- [ ] Mannequin model optimization (TODO: Create assets/mannequin_low.glb)
- [ ] Initial cloth simulation implementation
- [ ] Integration with the existing renderer
- [ ] Performance optimization
- [ ] RenderPeople license PDF in legal/ directory

## Branch Protection

This branch is protected by:
1. CODEOWNERS file requiring additional reviewers
2. CI/CD configuration that skips performance-heavy tests on R&D branches