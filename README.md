# Boyov VFR Project

This repository contains the web-based Virtual Fitting Room (VFR) prototype.
There are two sub-apps:

* `frontend` – legacy demo built with vanilla tooling
* `storefront` – a Next.js commerce storefront that integrates the VFR widget

## Quick Start

1. Install dependencies for the whole workspace:
   ```bash
   pnpm install -w
   ```
2. Start the storefront dev server:
   ```bash
   pnpm dev -F storefront
   ```
   The app should now be running at <http://localhost:3000>.

Vercel deploys from this directory via `vercel.json`:
```json
{
  "rootDirectory": "storefront",
  "framework": "nextjs",
  "installCommand": "corepack enable && pnpm install --frozen-lockfile",
  "buildCommand": "pnpm run build"
}
```

See the docs inside `frontend` for more details on the original demo.
