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