# Sprint 2 Final Steps

## Remaining Actions

| Action | Command / Step | Output / Target |
|--------|---------------|-----------------|
| 1. Upload assets & deploy Worker | `aws s3 cp frontend/public/models s3://vfr-assets --recursive`<br>`cd workers && npx wrangler deploy` | Worker URL (e.g., https://vfr-edge.*.workers.dev) |
| 2. Update Viewer & run Lighthouse | In VFRViewer.tsx:<br>- Set `ASSET_BASE = "https://vfr-edge.*.workers.dev"`<br>- Set `USE_CLOUDFLARE = true`<br>- Start dev server<br>- `lighthouse http://localhost:3000 --preset=experimental --output=csv --output-path=docs/perf/run_edge.csv` | docs/perf/run_edge.csv with TTFVF < 600 ms |
| 3. Fill cost sheet | Open docs/cost/AvatarWalletVFR_CostSheet.csv<br>Fill GPU seconds & KB from compress_logs.txt + cost formula | All SKUs ≤ €0.30 |

## Final Commit & PR

```bash
git add app/components/VFRViewer.tsx docs/perf/run_edge.csv docs/cost/AvatarWalletVFR_CostSheet.csv README_BENCHMARKS.md
git commit -m "perf: edge latency & full cost data (Sprint 2 complete)"
git push
```

Then:
1. Open Pull Request
2. Squash-merge
3. Tag v0.2.0-edge

## Final Verification

Before merging, verify:

- [ ] run_edge.csv shows FCP/FCPVF ≤ 600 ms
- [ ] Cost sheet contains 20 rows, all ≤ €0.30
- [ ] README_BENCHMARKS has real values (asset KB, FPS ≥ 45, TTFVF)
- [ ] VFRViewer.tsx has correct Worker URL and USE_CLOUDFLARE = true