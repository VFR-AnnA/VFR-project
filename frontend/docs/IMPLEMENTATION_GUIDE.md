# Implementation Guide: Refine + Texture Flow

This guide provides instructions for implementing the "Refine + Texture" flow with feature flags and additional enhancements.

## 1. Feature Flag Implementation

The feature flag system has been implemented in `app/config/featureFlags.js`. This allows for controlled rollout of features and easy disabling if needed.

### How to Use Feature Flags

```javascript
// Import the feature flag utility
const { isFeatureEnabled } = require('../config/featureFlags');

// Check if a feature is enabled
if (isFeatureEnabled('REFINE_PBR')) {
  // Implement PBR texture refinement
}
```

### Available Feature Flags

- `REFINE_PBR`: Enable PBR textures in the refine step
- `CDN_CACHING`: Enable CDN caching for generated models
- `CREDIT_TRACKING`: Enable credit tracking in admin panel

### Enabling/Disabling Features

To enable or disable features, modify the feature flags in `app/config/featureFlags.js`:

```javascript
// Production environment
production: {
  REFINE_PBR: true,  // Set to false to disable
  CDN_CACHING: false,
  CREDIT_TRACKING: false
}
```

## 2. Merging to Main Branch

To merge the Refine + Texture flow to the main branch:

1. Ensure all tests pass
2. Create a pull request with the following changes:
   - API route changes in `app/api/generate/route.ts`
   - Feature flag implementation in `app/config/featureFlags.js`
   - Documentation in `docs/PBR-TEXTURES.md`
3. Review the changes and merge to main

## 3. Future Enhancements

### Progress Overlay with SWR/React-Query

Implement a real-time progress tracking UI:

1. Create a status endpoint at `app/api/status/route.ts`
2. Use SWR or React-Query to poll the status endpoint
3. Display progress information with estimated time remaining

```javascript
// Example with SWR
import useSWR from 'swr';

function useGenerationStatus(taskId) {
  return useSWR(
    taskId ? `/api/status?id=${taskId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
}
```

### CDN Copy and Caching

Implement CDN caching for faster access to generated models:

1. After generation, copy the model and textures to a CDN (R2/S3)
2. Update the model URLs to point to the CDN
3. Set appropriate cache headers

```javascript
// Example implementation
async function copyToCDN(modelUrl, textureUrls) {
  // Download the model
  const modelResponse = await fetch(modelUrl);
  const modelBuffer = await modelResponse.arrayBuffer();
  
  // Upload to CDN
  await uploadToR2('models/123.glb', modelBuffer, {
    'cache-control': 'public, max-age=31536000, immutable'
  });
  
  // Return the CDN URL
  return 'https://cdn.example.com/models/123.glb';
}
```

### Credit Dashboard in Admin Panel

Implement a credit tracking system:

1. Track credit usage per user/IP
2. Store usage data in a database
3. Create an admin panel to view usage statistics

```javascript
// Example credit tracking
async function trackCreditUsage(userId, credits, operation) {
  await db.creditUsage.create({
    data: {
      userId,
      credits,
      operation,
      timestamp: new Date()
    }
  });
}
```

## 4. Development Tips

For faster development iterations:

- Use `quality:"draft"` parameter during development
- Enable `embed:true` to include textures in the GLB file
- Disable PBR when only testing model shape

## 5. Troubleshooting

If you encounter issues with the refine step timing out:

1. Check Meshy Dashboard to verify if the job is queued or running
2. Simplify prompts during development
3. Use 'draft' quality for faster development iterations
4. Consider implementing an asynchronous workflow for production