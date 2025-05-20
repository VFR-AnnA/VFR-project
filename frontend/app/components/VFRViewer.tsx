"use client";

import React, { Suspense, useEffect, useState, useRef, useMemo, useLayoutEffect, useCallback } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei";
import * as THREE from 'three';
import { Group, Bone, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { AvatarParams } from "./VFRViewerWrapper";
import { scaleSkeleton } from "../utils/scaleSkeleton";

// Default avatar parameters (if not provided from external types)
const DEFAULT_AVATAR_PARAMS = {
  heightCm: 175,
  chestCm: 95,
  waistCm: 80,
  hipCm: 100
};

// Default model URL - absoluut pad gebruiken voor zekerheid
const DEFAULT_MODEL_URL = '/models/mannequin.glb';

// Debug logging functie
const debugError = (message: string, ...args: unknown[]) => {
  console.error(`[VFRViewer] ${message}`, ...args);
};

// Debug logging function
const debug = (message: string, ...args: unknown[]) => {
  console.log(`[VFRViewer] ${message}`, ...args);
};

// Preload the default model to ensure it's available
// This is critical for avoiding the "Error loading model: {}" issue

// Helper function to convert measurement parameters to scale factors
const paramsToScaleFactors = (params: AvatarParams) => {
  const { heightCm, chestCm, waistCm, hipCm } = params;
  
  return {
    height: heightCm / 175, // Scale based on default height of 175cm
    chest: chestCm / 95,    // Scale based on default chest of 95cm
    waist: waistCm / 80,    // Scale based on default waist of 80cm
    hip: hipCm / 100        // Scale based on default hip of 100cm
  };
};

function LoadingSpinner() {
  return (
    <Html center>
      <div className="text-white">Loading model...</div>
    </Html>
  );
}

type ModelGLTF = {
  scene: Group;
  scenes: Group[];
  animations: THREE.AnimationClip[];
  cameras: THREE.Camera[];
  asset: { version: string; generator: string; };
};

interface ModelProps {
  url: string;
  avatarParams: AvatarParams;
}

interface ModelProps {
  url: string;
  avatarParams: AvatarParams;
  onLoaded?: () => void;
}

function Model({ url, avatarParams, onLoaded }: ModelProps) {
  debug("Rendering Model with URL:", url);
  
  // Zorg ervoor dat we altijd een geldige URL hebben
  const safeUrl = url && url.trim() !== "" ? url : DEFAULT_MODEL_URL;
  debug("Using validated URL:", safeUrl);
  
  // Setup loaders for better compression
  const draco = useMemo(() => {
    const loader = new DRACOLoader();
    loader.setDecoderPath('/draco/');
    return loader;
  }, []);
  
  // Gebruik useLoader met DRACO en Meshopt voor betere compressie en performance
  const gltf = useLoader(
    GLTFLoader,
    safeUrl,
    (loader: GLTFLoader) => {
      loader.setDRACOLoader(draco);
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
  ) as ModelGLTF;
  
  const { scene } = gltf;
  
  // State voor error handling
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  
  // Log wanneer het model is geladen
  useEffect(() => {
    if (scene) {
      debug(`Model loaded successfully: ${safeUrl}`);
      onLoaded?.();
    }
  }, [scene, safeUrl, onLoaded]);
  
  // Find and map bones for scaling
  const bones = useMemo(() => {
    const map: { spine?: Bone; chest?: Bone; hips?: Bone } = {};
    
    if (scene) {
      scene.traverse((child: Object3D) => {
        if (child instanceof THREE.Bone) {
          const name = child.name.toLowerCase();
          
          if (name.includes('spine') || name.includes('abdomen') || name.includes('middle')) {
            map.spine = child;
          } else if (name.includes('chest') || name.includes('torso') || name.includes('upper')) {
            map.chest = child;
          } else if (name.includes('hip') || name.includes('pelvis') || name.includes('lower')) {
            map.hips = child;
          }
        }
      });
    }
    
    debug(`Found bones: spine=${!!map.spine}, chest=${!!map.chest}, hips=${!!map.hips}`);
    return map;
  }, [scene]);
  
  // Calculate scale factor based on avatar parameters
  const calcScale = useCallback((params: AvatarParams) => {
    const baseScale = params.heightCm / 175; // Base scale on height
    return baseScale;
  }, []);

  // Apply avatar parameters using scale transformations
  useLayoutEffect(() => {
    if (modelRef.current) {
      try {
        if (Object.keys(bones).length > 0) {
          debug(`Applying scale factors using scaleSkeleton utility`);
          
          // Use the new utility for more dramatic scaling
          scaleSkeleton(bones, avatarParams);
          
          // Force geometry update
          modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry) {
              child.geometry.computeBoundingSphere();
            }
          });
        } else {
          // Fallback to transform scale if no bones found
          debug("No specific bones found, applying transform scale to entire model");
          
          // Use transform scale instead of changing dimensions
          const scaleFactor = calcScale(avatarParams);
          modelRef.current.scale.setScalar(scaleFactor);
          
          // Apply additional scaling for width/depth based on other parameters
          const widthScale = (avatarParams.chestCm / 95 + avatarParams.waistCm / 80 + avatarParams.hipCm / 100) / 3;
          modelRef.current.scale.x *= widthScale;
          modelRef.current.scale.z *= widthScale;
        }
      } catch (error) {
        debugError("Error applying parameters:", error);
        setError(`Error applying parameters: ${error}`);
      }
    }
  }, [avatarParams, bones, calcScale]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      debug(`Cleaning up model: ${safeUrl}`);
    };
  }, [safeUrl]);
  
  // Render error state
  if (error) {
    return (
      <Html center>
        <div className="text-red-500 p-4 bg-black bg-opacity-50 rounded">
          <p>Error with 3D model</p>
          <p className="text-xs mt-2">Using URL: {safeUrl}</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </Html>
    );
  }
  
  // Render the model
  return (
    <group position={[0, -0.5, 0]}>
      <primitive
        ref={modelRef}
        object={scene}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={0.9}
      />
    </group>
  );
}

// Simple fallback model component
function FallbackModel() {
  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[1, 1.7, 0.5]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  );
}

interface VFRViewerProps {
  avatarParams?: AvatarParams;
  meshUrl?: string;
}

export default function VFRViewer({
  avatarParams = DEFAULT_AVATAR_PARAMS,
  meshUrl = DEFAULT_MODEL_URL
}: VFRViewerProps) {
  // Uitgebreide validatie en debugging van de URL
  console.log("[VFRViewer] Received meshUrl:", meshUrl);
  
  // Absolute URL validatie - check voor null, undefined, lege string, of 'not available'
  const safeUrl = meshUrl && typeof meshUrl === 'string' && meshUrl.trim() !== "" && meshUrl !== "not available"
    ? meshUrl
    : DEFAULT_MODEL_URL;
    
  debug(`Rendering with meshUrl: ${safeUrl}`);
  
  // Error state voor top-level fouten
  const [hasError, setHasError] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  // Error boundary functie
  const handleError = (error: Error) => {
    console.error("[VFRViewer] Fatal rendering error:", error);
    setHasError(true);
    return null;
  };
  
  return (
    <div className="relative w-full max-w-[350px] h-[420px] mx-auto" style={{ background: '#1a1a1a' }}>
      {/* Placeholder that shows until the model loads */}
      {!isModelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/placeholder-avatar.svg" alt="Loading 3D Model" className="w-48 h-64" />
        </div>
      )}
      
      <Canvas
        className="absolute inset-0"
        camera={{
          position: [0, 0.5, 2.5],
          fov: 30,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          alpha: true,
          logarithmicDepthBuffer: true
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        {hasError ? (
          <FallbackModel />
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary fallbackComponent={FallbackModel}>
              <Model
                url={safeUrl}
                avatarParams={avatarParams}
                onLoaded={() => setIsModelLoaded(true)}
              />
              <Environment preset="city" />
              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={2}
                maxDistance={15}  // Allow zooming out more
                minPolarAngle={Math.PI / 8}  // Allow looking even more downward
                maxPolarAngle={Math.PI / 1.2}  // Keep upward view the same
              />
            </ErrorBoundary>
          </Suspense>
        )}
      </Canvas>
    </div>
  );
}

// React Error Boundary component
function ErrorBoundary({ 
  children, 
  fallbackComponent: FallbackComponent 
}: {
  children: React.ReactNode, 
  fallbackComponent: () => React.ReactElement
}) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("[VFRViewer] Error boundary caught:", event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  if (hasError) {
    return <FallbackComponent />;
  }
  
  return <>{children}</>;
}
