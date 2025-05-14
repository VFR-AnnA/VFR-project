# Progressive LOD Benchmark Results

## Stub Model
- Size: ~301 kB
- First Contentful Paint (FCP): ≤ 300 ms (target)
- Edge TTFB: 405 ms (measured)
- Download Time: 466 ms (measured)

## Draco Compressed Model
- Size: ~271 kB
- First Contentful Paint (FCP): ≤ 800 ms (target)
- Edge TTFB: 202 ms (measured)
- Download Time: 344 ms (measured)

## Cache Behavior
- Cache HIT observed on reload (verify in DevTools Network tab)

## Notes
- Stub file size is larger than the ideal target (~50 kB).
- Draco compressed file size is larger than the ideal target (≤ 150 kB).
- Further optimization may be needed for production readiness.

## Body-AI Measurement Performance

### MediaPipe Pose Detection
- Initial Load Time: ~1.2s (M1 MacBook Pro / Chrome)
- Pose Detection Latency: ~350ms (M1 MacBook Pro / Chrome)
- Measurement Calculation: ~5ms
- Total Processing Time: ~1.55s

### Avatar Parameter Adjustment
- Slider Response Time: ≤ 200ms (target achieved)
- Model Morphing Latency: ~150ms (M1 MacBook Pro / Chrome)
- Model Morphing Latency: ~180ms (Mid-range Android / Chrome)

### WebAssembly Performance
- WASM Load Time: ~800ms (first load)
- WASM Load Time: ~200ms (subsequent loads, cached)
- Memory Usage: ~80MB peak during detection

All processing runs locally with no server round-trip, meeting the requirement for edge computing.

## Latest Performance Metrics (v0.4.0-body-ai)
- Commit: beb19078e151844b2b8870420410ce0863a576bc
- Largest Contentful Paint (LCP): 0.56s
- Interaction to Next Paint (INP): 24ms
- Accessibility Score: 99%