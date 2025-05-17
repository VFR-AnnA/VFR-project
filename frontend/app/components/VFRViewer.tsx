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

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import * as THREE from 'three';
import { Group } from 'three';
import { AvatarParams, DEFAULT_AVATAR_PARAMS, paramsToScaleFactors } from "../../types/avatar-params";

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
}

function ProgressiveModel({ stubUrl, fullUrl, avatarParams }: ProgressiveModelProps) {
  // Use the useGLTF hook at the component level
  const { scene: fullScene } = useGLTF(fullUrl) as ModelGLTF;
  const { scene: stubScene } = useGLTF(stubUrl) as ModelGLTF;
  
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  
  // Memoize scale factors to avoid unnecessary calculations
  const scaleFactors = useMemo(() => {
    return paramsToScaleFactors(avatarParams);
  }, [
    avatarParams.heightCm,
    avatarParams.chestCm,
    avatarParams.waistCm,
    avatarParams.hipCm
  ]);

  // Apply avatar parameters as scale factors
  useEffect(() => {
    if (!modelRef.current) return;
    
    const { height, chest, waist, hip } = scaleFactors;
    
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
  }, [scaleFactors, model]);

  useEffect(() => {
    try {
      // First set the stub model
      debug('Loading stub model:', stubUrl);
      setModel(stubScene);
      
      // Then set the full model after a short delay
      const timer = setTimeout(() => {
        debug('Loading full model:', fullUrl);
        setModel(fullScene);
        setIsLoading(false);
        debug('Models loaded successfully');
      }, 100);
      
      return () => clearTimeout(timer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      debug('Error loading models:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [stubScene, fullScene, stubUrl, fullUrl]);

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
      />
    </group>
  );
}

interface VFRViewerProps {
  avatarParams?: AvatarParams;
}

export default function VFRViewer({ avatarParams = DEFAULT_AVATAR_PARAMS }: VFRViewerProps) {
  debug('Received avatarParams:', avatarParams);
  debug('Passing to ProgressiveModel:', avatarParams);
  
  // Memoize the entire ProgressiveModel to skip re-renders when avatarParams haven't changed
  const memoizedModel = useMemo(() => (
    <ProgressiveModel
      stubUrl={`${MODELS_PATH}/mannequin-stub.glb`}
      fullUrl={`${MODELS_PATH}/mannequin-draco.glb`}
      avatarParams={avatarParams}
    />
  ), [
    avatarParams.heightCm,
    avatarParams.chestCm,
    avatarParams.waistCm,
    avatarParams.hipCm
  ]);
  
  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} className="aspect-square md:aspect-[4/3]">
      <Canvas
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
        
        <Suspense fallback={<LoadingSpinner />}>
          {memoizedModel}
          <Environment preset="city" />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={15}  // Allow zooming out more
            minPolarAngle={Math.PI / 8}  // Allow looking even more downward
            maxPolarAngle={Math.PI / 1.2}  // Keep upward view the same
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload models
useGLTF.preload(`${MODELS_PATH}/mannequin-stub.glb`);
useGLTF.preload(`${MODELS_PATH}/mannequin-draco.glb`);
