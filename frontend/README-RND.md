# WebGPU Cloth Drape Experiment

This is an R&D branch for experimenting with WebGPU-based cloth simulation for the VFR project. The goal is to achieve realistic cloth draping on the mannequin model using compute shaders.

## Prerequisites

- A browser with WebGPU support (Chrome 113+, Edge 113+, or Firefox with flags enabled)
- Node.js 18+ and npm
- Git

## Getting Started

1. Clone the repository and checkout the R&D branch:

```bash
git clone https://github.com/Boyov69/VFR-project.git
cd VFR-project/frontend
git checkout rnd/drape-webgpu
```

2. Install dependencies:

```bash
npm install
```

3. Enable the experimental feature by creating a `.env` file:

```bash
echo "NEXT_PUBLIC_ENABLE_DRAPE=true" > .env
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser at [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/config/featureFlags.ts` - Feature toggle for the drape experiment
- `app/shaders/wgsl/clothSolver.wgsl` - WebGPU compute shader for cloth simulation
- `scripts/bench/drape_bench.ts` - Benchmarking script for performance testing

## Running Performance Tests

To run the performance benchmarks:

```bash
# Run the benchmark script
npx ts-node scripts/bench/drape_bench.ts

# Results will be saved to bench-results/ directory
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

4. Document any significant findings or optimizations in this README

## Current Status

- [x] Project setup and branch creation
- [x] Feature flag implementation
- [x] Basic compute shader boilerplate
- [x] Performance benchmarking script
- [ ] Mannequin model optimization
- [ ] Initial cloth simulation implementation
- [ ] Integration with the existing renderer
- [ ] Performance optimization

## License

See the main project license file for details.