# Vercel Deployment Checklist for Monday Demo

## Pre-Deployment Verification

### 1. Asset Files Check
All files in `public/` directory will be served at root path:
- ✅ `/public/models/mannequin.glb` → `https://domain.com/models/mannequin.glb`
- ✅ `/public/models/clothes/hoodie.glb` → `https://domain.com/models/clothes/hoodie.glb`
- ✅ `/public/lib/meshopt_decoder.module.js` → `https://domain.com/lib/meshopt_decoder.module.js`

**Note**: Linux filesystems are case-sensitive. Ensure all filenames match exactly.

### 2. MeshoptDecoder Loading Order
The decoder MUST be loaded before any GLTFLoader usage:
1. In `cegeka-demo.html`: Decoder is loaded in a module script before other scripts
2. In `ClothingManager.js`: Decoder setup waits for global availability

### 3. Routes vs Static HTML
- **Next.js Routes** (no .html extension):
  - `/` → `app/page.tsx`
  - `/shop` → `app/shop/page.tsx`
  - `/google-vs-vfr` → `app/google-vs-vfr/page.tsx`
  
- **Static HTML** (requires .html extension):
  - `/cegeka-demo.html` → `public/cegeka-demo.html`
  - `/generator-demo.html` → `public/generator-demo.html`

### 4. Environment Variables
Ensure these are set in Vercel:
```
NEXT_PUBLIC_HUNYUAN_API_KEY=your-key
NEXT_PUBLIC_MESHY_API_KEY=your-key
```

## Deployment Commands

```bash
# Current branch: demo-monday-clean
git add -A
git commit -m "fix: ensure MeshoptDecoder loads before GLTFLoader

- Updated load order in cegeka-demo.html
- Added decoder availability check in ClothingManager.js
- This fixes the 'setMeshoptDecoder must be called' error in production"

# Push to origin
git push -u origin demo-monday-clean

# Deploy to Vercel (if not auto-deploying)
vercel --prod
```

## Post-Deployment Verification

1. **Check Asset Loading**:
   ```bash
   curl -I https://your-deployment.vercel.app/models/mannequin.glb
   curl -I https://your-deployment.vercel.app/models/clothes/hoodie.glb
   curl -I https://your-deployment.vercel.app/lib/meshopt_decoder.module.js
   ```
   All should return `200 OK`

2. **Test Key Pages**:
   - Main page: `/`
   - Cegeka demo: `/cegeka-demo.html`
   - Shop demo: `/shop`
   - Google vs VFR: `/google-vs-vfr`

3. **Check Console for Errors**:
   - No 404 errors
   - No "MeshoptDecoder must be called" errors
   - "MeshoptDecoder loaded: true" should appear

## Branch Strategy

- **Production**: `demo-monday-clean` (stable Monday demo)
- **Development**: `feat/next-commerce-angel-store` (commerce experiments)
- **Storefront**: Create separate `storefront-playground` branch for isolated experiments

## Known Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on model files | Check exact filename casing |
| MeshoptDecoder error | Ensure decoder loads before GLTFLoader |
| Route 404 | Use `.html` for static files, no extension for Next.js routes |
| CORS errors | All assets should be in `/public` directory |