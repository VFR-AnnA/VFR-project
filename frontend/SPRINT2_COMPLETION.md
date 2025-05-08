# Sprint 2 Completion Steps

This document outlines the final steps needed to complete Sprint 2.

## 1. Upload Assets to R2

Upload all GLB models to the Cloudflare R2 bucket:

```bash
aws s3 cp frontend/public/models s3://vfr-assets --recursive
```

## 2. Deploy and Test the Worker

Deploy the Cloudflare Worker:

```bash
cd workers
npx wrangler deploy
```

Note the Worker URL (e.g., https://vfr-edge.your-subdomain.workers.dev)

## 3. Update the Viewer URL

Update the VFRViewer.tsx file to use the Worker URL:

1. Open app/components/VFRViewer.tsx
2. Update the workerUrl variable with your actual Worker URL
3. Uncomment the production Model component and comment out the local development one

## 4. Run Lighthouse for Edge Performance

Run Lighthouse to measure the Time To First Visual Frame (TTFVF):

```bash
lighthouse --preset=experimental https://localhost:3000 --output=csv --output-path=docs/perf/run_edge.csv
```

## 5. Fill in the Cost Sheet

Update the docs/cost/AvatarWalletVFR_CostSheet.csv file with actual data:

1. Use the data from compress_logs.txt
2. Calculate the cost for each SKU
3. Ensure the cost per SKU is ≤ €0.30

## 6. Update README_BENCHMARKS

Update the README_BENCHMARKS.md file with actual performance metrics:

1. Asset size (target: ≤ 150 KB)
2. Viewer FPS (target: ≥ 45 FPS)
3. Edge TTFVF (target: < 600 ms)
4. Cost per SKU (target: ≤ €0.30)

## 7. Final Git Operations

Commit and push the changes:

```bash
git add docs/perf/run_edge.csv docs/cost/AvatarWalletVFR_CostSheet.csv README_BENCHMARKS.md
git commit -m "perf: edge benchmark + filled cost sheet (SKU 1-20)"
git push
```

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
- [ ] Viewer URL updated
- [ ] Lighthouse benchmarks completed
- [ ] Cost sheet filled
- [ ] README_BENCHMARKS updated
- [ ] Changes committed and pushed
- [ ] PR created and merged
- [ ] v0.2.0-edge tag created