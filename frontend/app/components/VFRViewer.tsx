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

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import * as THREE from 'three';
import { Group } from 'three';
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

interface ProgressiveModelProps {
  stubUrl: string;
  fullUrl: string;
  avatarParams: AvatarParams;
  isPreloaded?: boolean;
}

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
  isPreloaded = false
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
          {/* Use the new RealisticAvatar component */}
          <RealisticAvatar
            avatarParams={avatarParams}
            isPreloaded={isPreloaded}
            useRealisticModel={true}
          />
          <Environment preset="city" />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={15}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 1.2}
            makeDefault // Ensure controls are properly disposed
            // Use the memoized callback
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
