# Sprint 2 Completion Steps

This document outlines the final steps needed to complete Sprint 2.

## What's Missing for Green Light

| File | Current Status | Required Result |
|------|----------------|-----------------|
| docs/perf/run_edge.csv | Placeholder | Lighthouse export with real TTFVF (< 600 ms) |
| docs/cost/AvatarWalletVFR_CostSheet.csv | Placeholder | 20 rows filled, Cost ≤ €0.30 |
| README_BENCHMARKS.md | Placeholder values | Real values for Asset kB, FPS, TTFVF, €/SKU |
| VFRViewer.tsx | `ASSET_BASE = "<CLOUDFLARE_WORKER_URL>"` | Real Worker URL |

## Action Plan

### 1. Assets → R2 & Worker Test

Upload assets to R2 and deploy the Worker:

```bash
# Upload assets to R2
aws s3 cp frontend/public/models s3://vfr-assets --recursive

# Deploy the Worker
cd workers
npx wrangler deploy   # note the URL: https://vfr-edge.<sub>.workers.dev
```

Then update the `ASSET_BASE` constant in VFRViewer.tsx with the Worker URL and set `USE_CLOUDFLARE` to `true`.

### 2. Edge-Lighthouse Run

Run Lighthouse to measure the Time To First Visual Frame (TTFVF):

```bash
lighthouse http://localhost:3000 \
  --preset=experimental \
  --output=csv \
  --output-path=docs/perf/run_edge.csv
```

Verify that first-contentful-paint is ≤ 600 ms.

### 3. Cost Sheet

Open docs/cost/AvatarWalletVFR_CostSheet.csv and fill in:

1. GPU Time (s) from compress_logs.txt
2. Storage/Upload (kB) per .glb file
3. Calculate Cost (should be ≤ €0.30)

### 4. Final Commit

Commit and push all changes:

```bash
git add docs/perf/run_edge.csv docs/cost/AvatarWalletVFR_CostSheet.csv README_BENCHMARKS.md app/components/VFRViewer.tsx
git commit -m "perf: edge benchmarks + full cost sheet"
git push
```

### 5. Pull Request and Tag

Create a pull request to merge the feature/webgpu-renderer branch into main.

After merging, create a tag:

```bash
git checkout main
git pull
git tag v0.2.0-edge -m "Sprint 2 completion"
git push --tags
```

## Verification Checklist

- [ ] Assets uploaded to R2
- [ ] Worker deployed and tested
- [ ] `ASSET_BASE` updated with real Worker URL
- [ ] `USE_CLOUDFLARE` set to true
- [ ] Lighthouse benchmarks completed (TTFVF < 600 ms)
- [ ] Cost sheet filled (Cost ≤ €0.30)
- [ ] README_BENCHMARKS updated with real values
- [ ] Changes committed and pushed
- [ ] PR created and merged
- [ ] v0.2.0-edge tag created