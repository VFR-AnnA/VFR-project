"use client";

// Polyfill for ProgressEvent
// Polyfill for ProgressEvent with eslint-disable for the any type
if (typeof window !== 'undefined' && typeof ProgressEvent === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ProgressEvent = class ProgressEvent extends Event {
    lengthComputable: boolean;
    loaded: number;
    total: number;
    
    constructor(type: string, init?: ProgressEventInit) {
      super(type, init);
      this.lengthComputable = init?.lengthComputable || false;
      this.loaded = init?.loaded || 0;
      this.total = init?.total || 0;
    }
  };
}

// Add type declaration for window
declare global {
  interface Window {
    invalidateFrameloop: () => void;
  }
}

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html, Stage } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import * as THREE from 'three';
import { Group } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AvatarParams, DEFAULT_AVATAR_PARAMS, paramsToScaleFactors } from "../../types/avatar-params";
import RealisticAvatar from "./RealisticAvatar";

const MODELS_PATH = '/models';

// Debug logging function
const debug = (message: string, ...args: unknown[]) => {
  console.log(`[VFRViewer] ${message}`, ...args);
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

interface WebGPUModelProps {
  url: string;
  avatarParams?: AvatarParams;
}

// WebGPU-optimized model component
function WebGPUModel({ url, avatarParams }: WebGPUModelProps) {
  const gltf = useLoader(GLTFLoader, url) as { scene: THREE.Group };
  const modelRef = useRef<THREE.Group>(null);
  
  // Log model structure once on load to understand its components
  useEffect(() => {
    if (modelRef.current) {
      console.log("MODEL STRUCTURE:");
      // Find bones/skeleton to work with
      let skeletonFound = false;
      let bonesFound: string[] = [];
      
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          console.log(`Mesh name: ${node.name}`);
          // Check for skeleton using a safer approach (assuming a SkinnedMesh would have this)
          if ('skeleton' in node || node.type === 'SkinnedMesh') {
            skeletonFound = true;
            console.log("Skeleton found on mesh:", node.name);
          }
        } else if (node instanceof THREE.Object3D) {
          console.log(`Object3D name: ${node.name}`);
          // Check if this might be a bone based on naming
          if (node.name.toLowerCase().includes("joint") ||
              node.name.toLowerCase().includes("bone") ||
              node.name.toLowerCase().includes("skeleton")) {
            bonesFound.push(node.name);
          }
        }
      });
      
      console.log("Skeleton found:", skeletonFound);
      console.log("Possible bones:", bonesFound);
    }
  }, [gltf]);

  // Track previous values to detect changes
  const prevAvatarParamsRef = useRef(avatarParams);
  
  // Apply transformations with SUPER EXTREME exaggeration for demo visibility
  useEffect(() => {
    if (!modelRef.current || !avatarParams) return;
    
    // Check if values actually changed
    const prev = prevAvatarParamsRef.current || {heightCm: 175, chestCm: 95, waistCm: 80, hipCm: 100};
    const changed = prev?.heightCm !== avatarParams.heightCm ||
                   prev?.chestCm !== avatarParams.chestCm ||
                   prev?.waistCm !== avatarParams.waistCm ||
                   prev?.hipCm !== avatarParams.hipCm;
    
    console.log("🔄 AVATAR PARAMS UPDATED:", avatarParams);
    console.log("Values changed?", changed ? "YES! Applying new transformation" : "No");
    
    // Store current values for next comparison
    prevAvatarParamsRef.current = {...avatarParams};
    
    // THE MOST EXTREME, VISIBLE TRANSFORMATIONS POSSIBLE
    // Completely unrealistic but unmistakably visible changes
    
    // 1. Calculate extreme scaling factors (MASSIVE exaggeration)
    const heightDelta = avatarParams.heightCm - 175; // Difference from default
    const chestDelta = avatarParams.chestCm - 95;    // Difference from default
    const waistDelta = avatarParams.waistCm - 80;    // Difference from default
    const hipDelta = avatarParams.hipCm - 100;       // Difference from default
    
    // 2. RIDICULOUSLY amplify these deltas for unmissable visual effect
    const heightFactor = 1.0 + (heightDelta / 25);     // 25cm change = 2x size!
    const chestFactor = 1.0 + (chestDelta / 7.5) * 2;  // 7.5cm change = 3x width!!
    const waistFactor = 1.0 + (waistDelta / 10) * 2;   // 10cm change = 3x depth!!
    const hipFactor = 1.0 + (hipDelta / 10) * 2;       // 10cm change = 3x depth!!
    
    console.log(`🔄 RIDICULOUSLY EXAGGERATED scaling factors:
      Height: ${heightFactor.toFixed(2)} (delta: ${heightDelta})
      Chest: ${chestFactor.toFixed(2)} (delta: ${chestDelta})
      Waist: ${waistFactor.toFixed(2)} (delta: ${waistDelta})
      Hip: ${hipFactor.toFixed(2)} (delta: ${hipDelta})`);
    
    // Apply comically extreme non-uniform scaling to the ENTIRE model
    modelRef.current.scale.set(
      chestFactor * 1.5,    // Width (X) - MASSIVELY affected by chest (1.5x multiplier)
      heightFactor * 1.2,   // Height (Y) - GREATLY affected by height (1.2x multiplier)
      (waistFactor + hipFactor) / 2 * 1.8  // Depth (Z) - EXTREMELY affected by waist/hip (1.8x multiplier)
    );
    
    // Add color changes based on measurements to make changes even more obvious
    modelRef.current.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material) {
        // Make model glow/change based on measurements
        if (Math.abs(chestDelta) > 3 || Math.abs(waistDelta) > 3 || Math.abs(hipDelta) > 3) {
          try {
            // If any measurement is far from default, make the model visually different
            if (node.material.color) {
              // Add a slight color tint based on how far from defaults
              const colorShift = Math.max(
                Math.abs(chestDelta/25),
                Math.abs(waistDelta/20),
                Math.abs(hipDelta/30)
              );
              
              // Tint toward red for bigger measurements
              if (colorShift > 0.1) {
                console.log(`🎨 Applied color shift: ${colorShift.toFixed(2)}`);
                // This won't actually change the texture but will tint it
                node.material.emissive = new THREE.Color(colorShift, 0, 0);
                node.material.emissiveIntensity = colorShift * 2;
              }
            }
          } catch (e) {
            console.log("Material modification error (non-critical):", e);
          }
        }
      }
    });
    
    // Add dramatic rotation for even more obvious visual change
    if (Math.abs(chestDelta) > 3 || Math.abs(hipDelta) > 3) {
      // Create an extremely visible tilt effect based on chest vs hip difference
      const tiltAmount = (chestDelta - hipDelta) / 50; // Much more dramatic tilt
      modelRef.current.rotation.z = tiltAmount;
      console.log(`🔄 Applied DRAMATIC tilt effect: ${tiltAmount.toFixed(2)} radians`);
      
      // Also add some Y-axis rotation for even more visibility
      modelRef.current.rotation.y = (chestDelta + hipDelta) / 100;
    }
    
    // Request a render frame after changes
    if (typeof window !== 'undefined' && window.invalidateFrameloop) {
      window.invalidateFrameloop();
    } else {
      window.dispatchEvent(new CustomEvent('request-render'));
    }
    
    console.log("✅ Applied EXTREME transformations - changes should be impossible to miss");
  }, [avatarParams, gltf]);

  return <primitive ref={modelRef} object={gltf.scene} dispose={null} />;
}

interface ProgressiveModelProps {
  stubUrl: string;
  fullUrl: string;
  avatarParams: AvatarParams;
  isPreloaded?: boolean;
}

// TODO: Remove after avatar-pipeline V2 implementation
// This component is not currently used but kept for future reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProgressiveModel({ stubUrl, fullUrl, avatarParams, isPreloaded = false }: ProgressiveModelProps) {
  // Use the useGLTF hook at the component level with draco decoder
  const { scene: fullScene } = useGLTF(fullUrl, true) as ModelGLTF; // Enable draco decoder
  const { scene: stubScene } = useGLTF(stubUrl) as ModelGLTF;
  
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  
  // Listen for render requests (for demand-driven rendering)
  useEffect(() => {
    const handleRenderRequest = () => {
      if (typeof window !== 'undefined' && window.invalidateFrameloop) {
        window.invalidateFrameloop();
      }
    };
    
    window.addEventListener('request-render', handleRenderRequest);
    return () => {
      window.removeEventListener('request-render', handleRenderRequest);
    };
  }, []);

  // Apply avatar parameters as scale factors
  useEffect(() => {
    if (modelRef.current) {
      const { height, chest, waist, hip } = paramsToScaleFactors(avatarParams);
      
      // Apply overall height scaling
      modelRef.current.scale.y = 0.9 * height;
      
      // Find and scale specific body parts if they exist
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const name = child.name.toLowerCase();
          
          // Apply specific scaling to body parts
          if (name.includes('chest') || name.includes('torso') || name.includes('upper')) {
            child.scale.x = chest;
            child.scale.z = chest;
          } else if (name.includes('waist') || name.includes('abdomen') || name.includes('middle')) {
            child.scale.x = waist;
            child.scale.z = waist;
          } else if (name.includes('hip') || name.includes('pelvis') || name.includes('lower')) {
            child.scale.x = hip;
            child.scale.z = hip;
          }
        }
      });
    }
  }, [avatarParams, model]);

  useEffect(() => {
    try {
      // If the model is already preloaded, use the full model directly
      if (isPreloaded) {
        debug('Using preloaded model');
        setModel(fullScene);
        setIsLoading(false);
      } else {
        // First set the stub model
        debug('Loading stub model:', stubUrl);
        setModel(stubScene);
        
        // Use requestIdleCallback to load the full model when the browser is idle
        // This helps prevent blocking the main thread during initial interaction
        const loadFullModel = () => {
          debug('Loading full model:', fullUrl);
          // Use a microtask to avoid blocking the main thread
          setTimeout(() => {
            setModel(fullScene);
            setIsLoading(false);
            debug('Models loaded successfully');
            // Request a render after model change
            window.dispatchEvent(new CustomEvent('request-render'));
          }, 0);
        };
        
        if ('requestIdleCallback' in window) {
          const idleCallbackId = window.requestIdleCallback(loadFullModel, { timeout: 2000 });
          return () => window.cancelIdleCallback(idleCallbackId);
        } else {
          // Fallback for browsers without requestIdleCallback
          const timer = setTimeout(loadFullModel, 100);
          return () => clearTimeout(timer);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      debug('Error loading models:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [stubScene, fullScene, stubUrl, fullUrl, isPreloaded]);

  if (error) {
    return (
      <Html center>
        <div className="text-red-500">Error: {error}</div>
      </Html>
    );
  }

  if (isLoading || !model) {
    return <LoadingSpinner />;
  }

  return (
    <group position={[0, -0.5, 0]}>
      <primitive
        ref={modelRef}
        object={model}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={0.9}
        // Add onUpdate to trigger a render when the model changes
        onUpdate={() => {
          window.dispatchEvent(new CustomEvent('request-render'));
        }}
      />
      {/* Remove debug box in production */}
      {process.env.NODE_ENV !== 'production' && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      )}
    </group>
  );
}

interface VFRViewerProps {
  avatarParams?: AvatarParams;
  isPreloaded?: boolean;
  useWebGPU?: boolean;
}

// This component will be rendered inside the Canvas and handle the invalidateFrameloop setup
function CanvasSetup() {
  // Set up the window.invalidateFrameloop function using useFrame
  useFrame((state) => {
    if (typeof window !== 'undefined' && !window.invalidateFrameloop) {
      window.invalidateFrameloop = () => {
        state.invalidate();
      };
    }
    return null;
  });
  
  return null;
}

export default function VFRViewer({
  avatarParams = DEFAULT_AVATAR_PARAMS,
  isPreloaded = false,
  useWebGPU = false
}: VFRViewerProps) {
  // Create a memoized callback for OrbitControls onChange
  const handleControlsChange = useCallback(() => {
    // Request a single render frame when controls change
    if (typeof window !== 'undefined') {
      if (window.invalidateFrameloop) {
        window.invalidateFrameloop();
      } else {
        // Fallback if invalidateFrameloop is not set yet
        window.dispatchEvent(new CustomEvent('request-render'));
      }
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a', overflow: 'hidden', position: 'relative' }} className="mx-auto canvas-wrapper">
      <Canvas
        frameloop="demand" // Only render when needed to reduce INP
        camera={{
          position: [0, 0.5, 2.5],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          alpha: true,
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance' // Prefer GPU performance
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, 5]} intensity={1} color="white" />
        
        <CanvasSetup />
        <Suspense fallback={<LoadingSpinner />}>
          {useWebGPU ? (
            <Stage environment="city" intensity={0.6}>
              <WebGPUModel url="/models/mannequin.glb" avatarParams={avatarParams} />
            </Stage>
          ) : (
            <RealisticAvatar
              avatarParams={avatarParams}
              isPreloaded={isPreloaded}
              useRealisticModel={true}
            />
          )}
          <Environment preset="city" />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={15}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 1.2}
            makeDefault // Ensure controls are properly disposed
            onChange={handleControlsChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload models with link rel="preload"
useGLTF.preload(`${MODELS_PATH}/mannequin-draco.glb`);

// Add preload link for HD model to load it when browser is idle
if (typeof document !== 'undefined') {
  const linkExists = document.querySelector(`link[href="${MODELS_PATH}/mannequin-draco.glb"][rel="preload"]`);
  
  if (!linkExists) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = `${MODELS_PATH}/mannequin-draco.glb`;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    link.setAttribute('importance', 'low');
    document.head.appendChild(link);
  }
}
