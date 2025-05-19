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
import { Suspense, useEffect, useState, useRef } from "react";
import * as THREE from 'three';
import { Group } from 'three';
import { AvatarParams, DEFAULT_AVATAR_PARAMS, paramsToScaleFactors } from "../../types/avatar-params";

const MODELS_PATH = '/models';

// Debug logging function - using direct console.log for maximum visibility
const debug = (message: string, ...args: unknown[]) => {
  console.log(`[VFRViewer] ${message}`, ...args);
};

// Debug function to log morph targets
const logMorphTargets = (mesh: THREE.Mesh) => {
  console.log('🔍 Checking mesh for morph targets:', mesh.name);
  
  if (mesh.morphTargetDictionary) {
    console.log('✅ FOUND MORPH TARGETS:', Object.keys(mesh.morphTargetDictionary));
    console.log('Current morph influences:', [...(mesh.morphTargetInfluences || [])]);
  } else {
    console.log('❌ NO MORPH TARGETS found on mesh:', mesh.name);
  }
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

  // Mapping from parameter names to possible morph target names
  // We include multiple possible names for each parameter to increase chances of finding a match
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MORPH_MAP = {
    height: ['Height', 'height', 'Stature', 'stature', 'BodyHeight'],
    chest: ['ChestWidth', 'Chest', 'chest', 'ChestGirth', 'TorsoWidth', 'UpperBodyWidth'],
    waist: ['WaistGirth', 'Waist', 'waist', 'WaistWidth', 'Abdomen', 'MiddleBodyWidth'],
    hip: ['HipWidth', 'Hip', 'hip', 'HipGirth', 'Pelvis', 'LowerBodyWidth']
  };
  
  // Function to find the best matching morph target
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const findMorphTarget = (dictionary: Record<string, number>, possibleNames: string[]): number | undefined => {
    for (const name of possibleNames) {
      if (dictionary[name] !== undefined) {
        debug(`Found morph target match: ${name}`);
        return dictionary[name];
      }
    }
    return undefined;
  };

  // Apply avatar parameters as morph targets and scale factors
  useEffect(() => {
    // Log the current avatar parameters
    console.log('🔄 APPLYING AVATAR PARAMETERS:', avatarParams);
    
    if (modelRef.current) {
      const { height, chest, waist, hip } = paramsToScaleFactors(avatarParams);
      console.log('📏 Converted to scale factors:', { height, chest, waist, hip });
      
      // Apply overall scaling based on all parameters
      modelRef.current.scale.y = 0.9 * height;  // Height affects Y scale
      modelRef.current.scale.x = 0.9 * chest;   // Chest affects X scale
      modelRef.current.scale.z = 0.9 * waist;   // Waist affects Z scale
      
      console.log('📏 Applied direct scaling to model:', {
        scaleY: modelRef.current.scale.y,
        scaleX: modelRef.current.scale.x,
        scaleZ: modelRef.current.scale.z
      });
      
      // Find meshes with morph targets
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Log available morph targets for debugging
          if (process.env.NODE_ENV === 'development') {
            logMorphTargets(child);
          }
          
          // Try a direct approach to apply morph targets
          let morphTargetsApplied = false;
          
          if (child.morphTargetDictionary && child.morphTargetInfluences) {
            console.log('✅ FOUND MESH WITH MORPH TARGETS:', child.name);
            console.log('Available morph targets:', Object.keys(child.morphTargetDictionary));
            
            // Try to apply each parameter directly to all available morph targets
            // This is a brute force approach to see if any morph target responds
            Object.keys(child.morphTargetDictionary).forEach(morphName => {
              if (child.morphTargetDictionary && child.morphTargetInfluences) {
                const morphIndex = child.morphTargetDictionary[morphName];
                
                // Apply a significant value to see if it has any effect
                const value = 1.0; // Maximum influence
                child.morphTargetInfluences[morphIndex] = value;
                
                console.log(`✅ APPLIED MORPH TARGET: ${morphName} (index: ${morphIndex}) = ${value}`);
                morphTargetsApplied = true;
              }
            });
          } else {
            console.log('❌ NO MORPH TARGETS on mesh:', child.name);
          }
          
          // Fallback: If no morph targets were applied, use scaling as a fallback
          if (!morphTargetsApplied) {
            const name = child.name.toLowerCase();
            const { chest, waist, hip } = paramsToScaleFactors(avatarParams);
            
            console.log(`⚠️ NO MORPH TARGETS FOUND, using fallback scaling for mesh: ${child.name}`);
            
            // Apply specific scaling to body parts based on name
            if (name.includes('chest') || name.includes('torso') || name.includes('upper')) {
              child.scale.x = chest;
              child.scale.z = chest;
              console.log(`📏 Applied CHEST scaling: ${chest} to ${child.name}`);
            } else if (name.includes('waist') || name.includes('abdomen') || name.includes('middle')) {
              child.scale.x = waist;
              child.scale.z = waist;
              console.log(`📏 Applied WAIST scaling: ${waist} to ${child.name}`);
            } else if (name.includes('hip') || name.includes('pelvis') || name.includes('lower')) {
              child.scale.x = hip;
              child.scale.z = hip;
              console.log(`📏 Applied HIP scaling: ${hip} to ${child.name}`);
            }
          }
        }
      });
    }
  }, [avatarParams, model]);

  useEffect(() => {
    try {
      // First set the stub model
      console.log('🔄 Loading stub model:', stubUrl);
      setModel(stubScene);
      
      // Log the model structure to check for morph targets
      console.log('🔍 STUB MODEL STRUCTURE:');
      stubScene.traverse((child) => {
        console.log(`- ${child.type}: ${child.name}`);
        if (child instanceof THREE.Mesh) {
          console.log(`  Has morph targets: ${!!child.morphTargetDictionary}`);
          if (child.morphTargetDictionary) {
            console.log(`  Morph targets: ${Object.keys(child.morphTargetDictionary)}`);
          }
        }
      });
      
      // Then set the full model after a short delay
      const timer = setTimeout(() => {
        console.log('🔄 Loading full model:', fullUrl);
        setModel(fullScene);
        
        // Log the model structure to check for morph targets
        console.log('🔍 FULL MODEL STRUCTURE:');
        fullScene.traverse((child) => {
          console.log(`- ${child.type}: ${child.name}`);
          if (child instanceof THREE.Mesh) {
            console.log(`  Has morph targets: ${!!child.morphTargetDictionary}`);
            if (child.morphTargetDictionary) {
              console.log(`  Morph targets: ${Object.keys(child.morphTargetDictionary)}`);
            }
          }
        });
        
        setIsLoading(false);
        console.log('✅ Models loaded successfully');
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
  // Log the received avatar parameters
  console.log('🔍 VFRViewer: Received avatarParams:', avatarParams);
  
  // Log the parameters being passed to ProgressiveModel
  console.log('🔍 VFRViewer: Passing to ProgressiveModel:', avatarParams);
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
          {/* Pass each parameter directly to ensure they're being passed correctly */}
          <ProgressiveModel
            stubUrl={`${MODELS_PATH}/mannequin-stub.glb`}
            fullUrl={`${MODELS_PATH}/mannequin-draco.glb`}
            avatarParams={{
              heightCm: avatarParams.heightCm,
              chestCm: avatarParams.chestCm,
              waistCm: avatarParams.waistCm,
              hipCm: avatarParams.hipCm
            }}
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
