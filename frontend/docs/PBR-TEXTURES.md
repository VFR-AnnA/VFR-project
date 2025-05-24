# PBR Textures Implementation Guide

This document explains the implementation of high-resolution PBR (Physically Based Rendering) textures in the VFR Generator using Meshy's "Refine + Texture" flow.

## Overview

The "Refine + Texture" flow is a two-step process that generates high-quality 3D models with realistic PBR textures:

1. **Preview Step**: Generates a basic 3D model (white clay-mesh)
2. **Refine Step**: Enhances the model with high-resolution PBR textures

This approach significantly improves the visual quality of generated models by adding realistic materials, normal maps, roughness maps, and metallic maps.

## API Flow

The complete flow involves the following steps:

| Step | API Call (v2) | Key Parameters |
|------|---------------|----------------|
| 1. Preview | `POST /openapi/v2/text-to-3d` | `{ mode:"preview", prompt:"…", topology:"triangle" }` |
| 2. Poll | `GET /openapi/v2/text-to-3d/{previewId}` | Wait until `status:"SUCCEEDED"` |
| 3. Refine | `POST /openapi/v2/text-to-3d` | `{ mode:"refine", preview_task_id:"<previewId>", enable_pbr:true, texture_prompt:"realistic fabrics and denim" }` |
| 4. Poll | `GET /openapi/v2/text-to-3d/{refineId}` | Wait until `status:"SUCCEEDED"` |
| 5. Download | `task.model_urls.glb` + associated PNGs | Or use `embed:true` to include textures in GLB |

## Implementation Details

### Backend Changes

The implementation adds the refine step to the existing generation process:

1. The `generate` function in `app/api/generate/route.ts` now:
   - Performs the preview step as before
   - Adds a refine step with `enable_pbr: true` when requested
   - Returns the refined model URL with textures

### Frontend Changes

The UI has been updated to support PBR textures:

1. Added a checkbox to enable/disable PBR textures
2. Added a texture prompt input field for specifying material details
3. Updated the result display to show PBR texture information

### Texture Options

When using PBR textures, you can:

1. Specify a texture prompt to guide the material generation
2. Use the `embed:true` parameter to include textures directly in the GLB file
3. Alternatively, download the GLB and associated texture PNGs separately

## Performance Considerations

- PBR textures require additional processing time (typically 20-40 seconds)
- The total process (preview + refine) takes approximately 25-50 seconds for simple models
- Complex models or during peak load may take 3-5 minutes to complete
- PBR textures consume more credits (9 additional credits per model)

## Polling Strategy

The implementation uses an improved polling strategy to handle longer processing times:

1. **Exponential Backoff**: Polling intervals increase gradually (5s → 10s → 15s) to reduce API load
2. **Extended Timeout**: The refine step has a longer timeout (up to 10 minutes) to accommodate complex models
3. **Progress Tracking**: The API provides progress percentage updates during generation

## Example Implementation

```typescript
// --- 1. Preview ---
const preview = await fetch(BASE, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({ 
    mode: 'preview', 
    prompt 
  })
}).then(r=>r.json());

// pollPreview()...

// --- 2. Refine with PBR ---
const refine = await fetch(BASE, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify({
    mode: 'refine',
    preview_task_id: previewId,
    enable_pbr: true,
    texture_prompt: 'realistic cloth and denim'
  })
}).then(r=>r.json());

// pollRefine() ...

const { glb, textures } = await fetch(refineUrl).then(r=>r.json()).then(t=>t.model_urls);
```

## Texture Handling Options

### Option A: All-in-one file (simple & fast)

Add `embed:true` to both POST calls. Meshy will embed all textures as data-URIs in the GLB file, so your proxy only needs to forward a single file.

```json
{ "mode":"refine", "preview_task_id": "...", "embed": true, ... }
```

### Option B: Separate PNGs (best performance)

1. Download model.glb and each PNG under .../output/
2. Upload them to your CDN (R2/S3)
3. Use gltf-transform to rewrite the URIs in the GLB to point to your CDN

## Conclusion

The "Refine + Texture" flow significantly enhances the visual quality of generated 3D models by adding realistic PBR textures. While it requires additional processing time and credits, the improved visual fidelity makes it worthwhile for production-quality assets.

## Troubleshooting

If you encounter issues with the refine step timing out:

1. **Check Meshy Dashboard**: Verify if the job is queued or running
2. **Simplify Prompts**: Use simpler prompts during development
3. **Quality Setting**: Use 'draft' quality for faster development iterations
4. **Consider Async Processing**: For production use, consider implementing an asynchronous workflow where the client polls for completion