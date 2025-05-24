# Hunyuan 3D Provider Adapter

This adapter allows you to use the Tencent Hunyuan 3D SaaS API with the existing Gen3DProvider interface. It's a drop-in replacement for other providers like MeshyAdapter, requiring no changes to the viewer layer.

## Setup

1. Create a `.env` file in the root directory with the following variables:

```
HY3D_KEY=sk_live_xxx           # Your Hunyuan API key
HY3D_REGION=cn-shenzhen        # or ap-shanghai, see dashboard
GEN_PROVIDER=hunyuan           # Set Hunyuan as the default provider
```

2. The adapter is automatically registered on the client side through the `ProviderRegistration` component in `app/components/ProviderRegistration.tsx`, which is included in the layout.

## Usage

The adapter implements the `Gen3DProvider` interface, which provides the following methods:

### startJob

Starts a 3D generation job with the Hunyuan API.

```typescript
const { jobId, previewUrl } = await provider.startJob({
  prompt: "A red apple",
  mode: "avatar",          // avatar | clothing | accessory
  embed: true,             // true => textures baked in GLB (no CORS hassle)
  quality: "high",         // draft | high
});
```

### getStatus

Gets the status of a 3D generation job.

```typescript
const status = await provider.getStatus(jobId);
// status: { status: "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED", url?: string }
```

## Environment Variables

- `HY3D_KEY`: Your Hunyuan API key (required)
- `HY3D_REGION`: The region for the Hunyuan API (default: "cn-shenzhen")
- `GEN_PROVIDER`: Set to "hunyuan" to use this provider as the default

## API Endpoints

The adapter uses the following Hunyuan API endpoints:

- `POST /v2/generate`: Start a 3D generation job
- `GET /v2/status/{jobId}`: Get the status of a 3D generation job

## Error Handling

The adapter throws errors in the following cases:

- If the API key is not provided
- If the API returns a non-200 status code
- If the API response is not in the expected format