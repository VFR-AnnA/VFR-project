# VFR Generator Feature

## Overview

The VFR Generator is a feature that allows users to generate 3D models using AI. This feature is implemented as a modular extension to the existing VFR workflow, without introducing breaking changes.

## Architecture

The generator feature consists of the following components:

1. **Generator Service** - A TypeScript package that provides the core logic for generating 3D models
2. **Generator API** - A Next.js Edge function that exposes the generator service via a REST API
3. **Unity Plugin** - A Unity package that allows integration with the generator service in Unity applications
4. **Feature Flag** - A toggle to enable/disable the generator feature

## Performance Optimizations

The generator feature has been optimized for performance in several ways:

### 1. Route-based Code Splitting

The generator demo page is implemented using Next.js App Router's route groups feature. The page is located at:

```
app/(generator)/generator-demo/page.tsx
```

This structure ensures that the generator code is only loaded when the user navigates to the generator demo page, reducing the initial bundle size for other pages.

### 2. Dynamic Imports

The PBRViewer component (3D model viewer) is dynamically imported using Next.js's `dynamic` function:

```typescript
const PBRViewer = dynamic(() => import('../PBRViewer'), { 
  ssr: false,
  loading: () => <LoadingPlaceholder />
});
```

This ensures that the heavy 3D rendering libraries are only loaded when needed, improving the initial page load performance.

### 3. Resource Preloading

Critical resources are preloaded using the `next/head` component and the `link` tag:

```typescript
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="preload" href="/models/mannequin.glb" as="fetch" crossOrigin="anonymous" />
```

This improves the loading performance by establishing connections to external resources early and preloading critical assets.

### 4. Edge API

The Generator API is implemented as a Next.js Edge function, which provides lower latency and better performance compared to traditional serverless functions.

## Performance Testing

A script has been added to test the performance of the generator feature in production mode:

```bash
pnpm test:prod-perf
```

This script builds the application in production mode and starts it on port 4000. You can then open http://localhost:4000/generator-demo in your browser to test the performance.

### Performance Targets

- **LCP (Largest Contentful Paint)**: < 1.2s in production mode
- **INP (Interaction to Next Paint)**: < 200ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## Feature Flag

The generator feature is controlled by the `NEXT_PUBLIC_FEATURE_GEN` environment variable. When this variable is set to `true`, the generator feature is enabled.

To enable the feature, add the following to your `.env.local` file:

```
NEXT_PUBLIC_FEATURE_GEN=true
```

## Future Improvements

- Integrate with a real AI model for generating 3D models
- Add support for more model types (clothing, accessories, etc.)
- Improve the quality of generated models
- Add support for more export formats (USDZ, FBX, etc.)
- Implement Lighthouse CI to ensure performance targets are met
- Add more advanced 3D model manipulation features