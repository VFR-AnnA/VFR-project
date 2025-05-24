# 3D Generation Provider Selection

This document explains how to use the provider selection functionality in the VFR Generator API.

## Available Providers

The system currently supports the following 3D generation providers:

1. **Meshy.ai** - The default provider, used for generating 3D models from text prompts.
2. **Hunyuan 3D** - Tencent's Hunyuan 3D SaaS API for generating 3D models.

## Configuration

### Environment Variables

You can configure the default provider using environment variables in your `.env.local` file:

```
# Default 3D generation provider (meshy or hunyuan)
GEN_PROVIDER=meshy

# Meshy API Configuration
MESHY_KEY=your-meshy-api-key

# Hunyuan 3D API Configuration
HY3D_KEY=sk_live_xxx
HY3D_REGION=cn-shenzhen   # or ap-shanghai, see dashboard
```

### Provider-Specific Configuration

Each provider requires its own set of environment variables:

#### Meshy.ai
- `MESHY_KEY` - Your Meshy API key

#### Hunyuan 3D
- `HY3D_KEY` - Your Hunyuan API key
- `HY3D_REGION` - The region for the Hunyuan API (default: "cn-shenzhen")

## Usage

### UI Selection

The Generator Demo UI includes a dropdown menu to select the provider for each generation request. This allows you to switch between providers without changing the environment variables.

### API Usage

When making API requests, you can specify the provider in the request body:

```javascript
// Example API request
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A red apple',
    modelType: 'avatar',
    quality: 'high',
    enablePBR: true,
    provider: 'hunyuan'  // Specify the provider here
  }),
});
```

If no provider is specified, the system will use the default provider configured in the environment variables.

## Provider Information

You can get information about the available providers by making a GET request to the `/api/generate` endpoint:

```javascript
const response = await fetch('/api/generate');
const data = await response.json();
console.log(data.providers);  // List of available providers
console.log(data.defaultProvider);  // Default provider
```

## Implementation Details

The provider selection is implemented using a factory pattern:

1. The `ProviderFactory` in `lib/gen3d/ProviderFactory.ts` manages the registration and creation of provider instances.
2. The `getProvider` function in `app/utils/providerFactory.ts` selects the appropriate provider based on the request.
3. The API route in `app/api/generate/route.ts` uses the provider to generate the 3D model.

## Adding New Providers

To add a new provider:

1. Create a new adapter that implements the `Gen3DProvider` interface
2. Register the provider in the factory
3. Update the UI to include the new provider in the dropdown