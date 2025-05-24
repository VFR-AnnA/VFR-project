'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Loader } from '@react-three/drei';
import { Suspense, useRef, useEffect, useState } from 'react';
import { Group } from 'three';

// Configure the draco decoder path for compressed models
useGLTF.preload('/models/mannequin.glb', true);
useGLTF.preload('/models/mannequin-draco.glb', true);

type MannequinViewerProps = {
  src?: string;
  autoSpin?: boolean;
  height?: string;
  scale?: number; // Add scale prop for height-based scaling
};

import useGeneratorStore from '../hooks/useGeneratorStore';

export default function MannequinViewer({
  src = '/models/mannequin.glb',
  autoSpin = false,
  height = '450px',
  scale
}: MannequinViewerProps) {
  // Only get height from store if scale is not provided
  const heightCm = scale ? undefined : useGeneratorStore((s) => s.generatorResponse?.measurements?.heightCm);
  
  // Calculate scale based on height (default rig = 180 cm)
  const calculatedScale = scale ?? (heightCm ? heightCm / 180 : 1);
  
  // Log the scale factor for debugging
  useEffect(() => {
    if (!scale && heightCm) {
      console.log(`MannequinViewer: Using height-based scale factor: ${(heightCm / 180).toFixed(2)} (${heightCm}cm / 180cm)`);
    } else if (scale) {
      console.log(`MannequinViewer: Using fixed scale: ${scale}`);
    }
  }, [heightCm, calculatedScale, scale]);
  // Track loading status for debugging
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Add draco decoder path for global config
    if (typeof window !== 'undefined') {
      // Log what's happening for debugging
      console.log(`MannequinViewer: Loading model from ${src}`);
      
      // For visualization debugging
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn(`MannequinViewer: Still loading after 5s. Check if model path is correct: ${src}`);
        }
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [src, isLoading]);

  // Verify model src
  if (!src) {
    console.error('MannequinViewer: No model source provided');
    return <div className="w-full h-full bg-red-100 text-red-800 p-4">Error: No model source provided</div>;
  }

  return (
    <div
      className="w-full relative bg-gray-800 rounded-lg overflow-hidden"
      style={{ height: height, minHeight: "300px" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: '#1a1a1a' }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingFallback />}>
          <Model
            src={src}
            autoSpin={autoSpin}
            scale={scale}
            onLoad={() => setIsLoading(false)}
            onError={(msg) => {
              setHasError(true);
              setErrorMessage(msg);
              console.error(`MannequinViewer error: ${msg}`);
            }}
          />
        </Suspense>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
      
      {/* Loader component outside the Canvas */}
      <Loader dataInterpolation={(p) => `Loading 3D model... ${Math.round(p * 100)}%`} />
      
      {/* Controls help */}
      <div className="absolute bottom-4 left-4 text-white text-xs bg-black bg-opacity-50 p-2 rounded">
        <p>Drag to rotate | Scroll to zoom | Shift+drag to pan</p>
      </div>

      {/* Error display if needed */}
      {hasError && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">
          Error loading model: {errorMessage}
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

function Model({
  src,
  autoSpin,
  scale,
  onLoad,
  onError
}: MannequinViewerProps & {
  onLoad?: () => void;
  onError?: (message: string) => void;
}) {
  const group = useRef<Group>(null);
  
  try {
    // Use suspense to load the model
    const { scene } = useGLTF(src || '/models/mannequin.glb', true); // Enable draco decoder
    
    // Clone the scene to avoid issues
    const model = scene.clone();
    
    // Auto-rotate the model if enabled
    useFrame((state, delta) => {
      if (autoSpin && group.current) {
        group.current.rotation.y += delta * 0.5;
      }
    });
    
    // Call the onLoad callback when the model is ready
    useEffect(() => {
      if (onLoad) onLoad();
      console.log(`MannequinViewer: Model loaded successfully from ${src}`);
    }, [src, onLoad]);
    
    // Only get height from store if scale is not provided
    const heightCm = scale ? undefined : useGeneratorStore((s) => s.generatorResponse?.measurements?.heightCm);
    
    // Calculate scale based on height (default rig = 180 cm)
    const baseScale = 1.5; // Original base scale
    const calculatedScale = scale ?? (heightCm ? (heightCm / 180) * baseScale : baseScale);
    
    // Only log height-based scaling when actually using it
    if (!scale && heightCm) {
      console.log(`MannequinViewer: Using height-based scale factor: ${(heightCm / 180).toFixed(2)} (${heightCm}cm / 180cm)`);
    } else if (scale) {
      console.log(`MannequinViewer: Using fixed scale: ${scale}`);
    }
    
    return (
      <group ref={group} position={[0, -1, 0]} scale={calculatedScale}>
        <primitive object={model} />
      </group>
    );
  } catch (error) {
    // Call the onError callback if loading fails
    useEffect(() => {
      if (onError) onError(error instanceof Error ? error.message : 'Unknown error loading model');
    }, [onError]);
    
    return <LoadingFallback />;
  }
}