# WebGPU Renderer

This document provides instructions for setting up and benchmarking the WebGPU renderer.

## Prerequisites

- Chrome 118+ with WebGPU enabled (chrome://flags/#enable-webgpu)
- Three.js r168+ for WebGL fallback

## Setup

1. Install the three-webgpu package:

```bash
npm install three-webgpu
```

2. Update the VFRViewer component to use the WebGPURenderer:

```tsx
import { WebGPURenderer } from 'three-webgpu';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

// ...

export default function VFRViewer() {
  return (
    <div className="w-full h-[480px]">
      <Canvas camera={{ fov: 35 }} shadows frameloop="demand" onCreated={({ gl }) => {
        if (!(gl instanceof WebGPURenderer)) {
          console.log("Using WebGL Renderer");
        } else {
          console.log("Using WebGPU Renderer");
        }
      }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url="/models/mannequin.glb" />
          </Stage>
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

## Testing

1. Open the application in Chrome with WebGPU enabled.
2. Check the console for "Using WebGPU Renderer" or "Using WebGL Renderer" to confirm which renderer is being used.
3. Test the application in a browser without WebGPU support (e.g., Edge non-Canary) to verify the WebGL fallback.

## Benchmarking

To measure the FPS (Frames Per Second), add the following code to the VFRViewer component:

```tsx
import Stats from 'three/examples/jsm/libs/stats.module.js';

// ...

export default function VFRViewer() {
  const stats = useRef<Stats>();

  useEffect(() => {
    stats.current = new Stats();
    stats.current.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.current.dom);

    return () => {
      stats.current && document.body.removeChild(stats.current.dom);
    };
  }, []);

  useFrame(() => {
    stats.current?.update();
  });

  // ...
}
```

Alternatively, you can log the FPS to the console:

```tsx
useFrame(({ clock }) => {
  console.log('FPS', 1000 / clock.getDelta());
});
```

The goal is to achieve a frame rate of at least 45 FPS on a laptop.

## Documentation

Document the benchmark results in the README_benchmarks.md file, including:

- Browser and version
- WebGPU or WebGL renderer
- FPS measurements
- Any issues encountered