# VFR Generator Feature

## Overview

The VFR Generator is a new feature that allows users to generate 3D models using AI. This feature is implemented as a modular extension to the existing VFR workflow, without introducing breaking changes.

## Architecture

The generator feature consists of the following components:

1. **Generator Service** - A TypeScript package that provides the core logic for generating 3D models
2. **Generator API** - A Next.js Edge function that exposes the generator service via a REST API
3. **Unity Plugin** - A Unity package that allows integration with the generator service in Unity applications
4. **Feature Flag** - A toggle to enable/disable the generator feature

### Generator Service

The generator service is implemented as a standalone package in the `services/generator` directory. It is built using `tsup` and provides a simple API for generating 3D models.

```typescript
import { generate } from '@/services/generator';

const result = await generate({
  prompt: 'A tall male avatar with blue eyes',
  modelType: 'avatar',
  quality: 'standard',
  format: 'glb'
});
```

### Generator API

The generator API is implemented as a Next.js Edge function in the `app/api/generate` directory. It exposes the generator service via a REST API.

**POST /api/generate**

Request:
```json
{
  "prompt": "A tall male avatar with blue eyes",
  "modelType": "avatar",
  "quality": "standard",
  "format": "glb"
}
```

Response:
```json
{
  "id": "gen_1234567890",
  "url": "https://example.com/models/avatar_1234567890.glb",
  "format": "glb",
  "createdAt": "2025-05-22T12:34:56.789Z",
  "metadata": {
    "prompt": "A tall male avatar with blue eyes",
    "modelType": "avatar",
    "quality": "standard"
  }
}
```

### Unity Plugin

The Unity plugin is implemented as a C# package in the `plugins/unity` directory. It provides a simple API for integrating with the generator service in Unity applications.

```csharp
// Get the instance
var vfr = AvatarWallet.VFR.AvatarWalletVFR.Instance;

// Initialize with your API key
vfr.Initialize("your-api-key-here");

// Generate an avatar
vfr.EnableGeneratorAPI();
var generatedAvatar = await vfr.GenerateAvatarAsync("A tall male avatar with blue eyes");
```

### Feature Flag

The generator feature is controlled by the `NEXT_PUBLIC_FEATURE_GEN` environment variable. When this variable is set to `true`, the generator feature is enabled.

```tsx
{process.env.NEXT_PUBLIC_FEATURE_GEN && <GeneratorDemo />}
```

## CI/CD Integration

The CI/CD pipeline has been updated to build the generator service and package the Unity plugin. The following steps have been added to the `.github/workflows/ci.yml` file:

```yaml
- name: Build generator
  run: pnpm --filter generator build

- name: Package Unity plugin
  run: pnpm --filter unity-plugin run pack
```

## Getting Started

To enable the generator feature:

1. Create a `.env.local` file with the following content:
   ```
   NEXT_PUBLIC_FEATURE_GEN=true
   ```

2. Start the development server:
   ```
   pnpm dev
   ```

3. Navigate to the generator demo page at `/generator-demo`

## Future Improvements

- Integrate with a real AI model for generating 3D models
- Add support for more model types (clothing, accessories, etc.)
- Improve the quality of generated models
- Add support for more export formats (USDZ, FBX, etc.)