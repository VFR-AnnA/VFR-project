"use client";

// Polyfill for ProgressEvent
if (typeof window !== 'undefined' && typeof ProgressEvent === 'undefined') {
  (window as any).ProgressEvent = class ProgressEvent extends Event {
    constructor(type: string, init?: ProgressEventInit) {
      super(type, init);
    }
  };
}

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from 'three';
import { Group } from 'three';

const MODELS_PATH = '/models';

// Debug logging function
const debug = (message: string, ...args: any[]) => {
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

function ProgressiveModel({ stubUrl, fullUrl }: { stubUrl: string; fullUrl: string }) {
  const [model, setModel] = useState<ModelGLTF | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        debug('Loading stub model:', stubUrl);
        const stubModel = await useGLTF(stubUrl) as ModelGLTF;
        setModel(stubModel);
        
        debug('Loading full model:', fullUrl);
        const fullModel = await useGLTF(fullUrl) as ModelGLTF;
        setModel(fullModel);
        
        setIsLoading(false);
        debug('Models loaded successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        debug('Error loading models:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadModels();
  }, [stubUrl, fullUrl]);

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
        object={model.scene}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={0.9}
      />
    </group>
  );
}

export default function VFRViewer() {
  return (
    <div style={{ width: '100%', height: '540px', background: '#1a1a1a' }}>
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
          <ProgressiveModel
            stubUrl={`${MODELS_PATH}/mannequin-stub.glb`}
            fullUrl={`${MODELS_PATH}/mannequin-draco.glb`}
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
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload models
useGLTF.preload(`${MODELS_PATH}/mannequin-stub.glb`);
useGLTF.preload(`${MODELS_PATH}/mannequin-draco.glb`);
