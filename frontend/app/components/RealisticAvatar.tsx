/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-21T13:41+02:00
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { loadModel } from "../utils/modelLoaders";
import { AvatarParams, paramsToScaleFactors } from "../../types/avatar-params";

// Define the paths to the models
const MODELS = {
  STUB: "/models/mannequin-stub.glb",
  DRACO: "/models/mannequin-draco.glb",
  // These would be the paths to the new realistic models
  REALISTIC_STUB: "/models/mannequin-stub.glb", // Fallback to existing model for now
  REALISTIC_DRACO: "/models/mannequin-draco.glb", // Fallback to existing model for now
};

// Preload the stub model
useGLTF.preload(MODELS.STUB);

interface RealisticAvatarProps {
  avatarParams: AvatarParams;
  isPreloaded?: boolean;
  useRealisticModel?: boolean;
}

export default function RealisticAvatar({
  avatarParams,
  isPreloaded = false,
  useRealisticModel = true,
}: RealisticAvatarProps) {
  // Get the Three.js renderer
  const { gl } = useThree();
  
  // References
  const modelRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determine which models to use based on the useRealisticModel prop
  const stubUrl = useRealisticModel ? MODELS.REALISTIC_STUB : MODELS.STUB;
  const fullUrl = useRealisticModel ? MODELS.REALISTIC_DRACO : MODELS.DRACO;
  
  // Load the models
  useEffect(() => {
    let isMounted = true;
    
    const loadModels = async () => {
      try {
        // If the model is already preloaded, use the full model directly
        if (isPreloaded) {
          console.log('Using preloaded model');
          const fullModel = await loadModel(fullUrl, gl);
          if (isMounted) {
            setModel(fullModel);
            setIsLoading(false);
          }
        } else {
          // First load the stub model
          console.log('Loading stub model:', stubUrl);
          const stubModel = await loadModel(stubUrl, gl);
          if (isMounted) {
            setModel(stubModel);
            
            // Use requestIdleCallback to load the full model when the browser is idle
            const loadFullModel = async () => {
              console.log('Loading full model:', fullUrl);
              try {
                const fullModel = await loadModel(fullUrl, gl);
                if (isMounted) {
                  setModel(fullModel);
                  setIsLoading(false);
                  console.log('Models loaded successfully');
                  // We don't need to call invalidate here as React will handle the re-render
                  // This was contributing to the infinite render loop
                }
              } catch (err) {
                console.error('Error loading full model:', err);
                if (isMounted) {
                  setError(err instanceof Error ? err.message : 'Unknown error loading model');
                }
              }
            };
            
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(() => loadFullModel(), { timeout: 2000 });
            } else {
              // Fallback for browsers without requestIdleCallback
              setTimeout(loadFullModel, 100);
            }
          }
        }
      } catch (err) {
        console.error('Error loading models:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error loading model');
          setIsLoading(false);
        }
      }
    };
    
    loadModels();
    
    // Clean up
    return () => {
      isMounted = false;
    };
  // Remove invalidate from the dependency array to prevent re-running this effect when invalidate changes
   
  }, [gl, stubUrl, fullUrl, isPreloaded]);
  
  // Apply avatar parameters as scale factors
  useEffect(() => {
    if (modelRef.current && model) {
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
      
      // We don't need to call invalidate here as React will handle the re-render
      // This was contributing to the infinite render loop
    }
   
  }, [avatarParams, model]);
  
  // Add event listener for request-render events
  useEffect(() => {
    const handleRenderRequest = () => {
      if (typeof window !== 'undefined' && window.invalidateFrameloop) {
        window.invalidateFrameloop();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('request-render', handleRenderRequest);
      return () => {
        window.removeEventListener('request-render', handleRenderRequest);
      };
    }
    return undefined;
  }, []);
  
  // Add a small animation to make the avatar more lifelike
  useFrame((state) => {
    if (modelRef.current) {
      // Subtle breathing animation
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      // We don't need to call invalidate here as useFrame already triggers a render
      // This was causing an infinite render loop
    }
  });
  
  // Preload the full model when the component mounts
  useEffect(() => {
    // Add preload link for HD model to load it when browser is idle
    if (typeof document !== 'undefined') {
      const linkExists = document.querySelector(`link[href="${fullUrl}"][rel="preload"]`);
      
      if (!linkExists) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fullUrl;
        link.as = 'fetch';
        link.crossOrigin = 'anonymous';
        link.setAttribute('importance', 'low');
        document.head.appendChild(link);
      }
    }
  }, [fullUrl]);
  
  // If there's an error, show an error message
  if (error) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
        <Html position={[0, 1.5, 0]} center>
          <div style={{ color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px' }}>
            Error: {error}
          </div>
        </Html>
      </mesh>
    );
  }
  
  // If the model is still loading, show a placeholder
  if (isLoading || !model) {
    return (
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="gray" wireframe />
      </mesh>
    );
  }
  
  // Render the model
  return (
    <group position={[0, -0.5, 0]}>
      <primitive
        ref={modelRef}
        object={model}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={0.9}
        // Remove the onUpdate callback to prevent infinite render loops
      />
    </group>
  );
}

// No need to create a custom Html component as we're importing it from drei