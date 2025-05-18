/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useEffect } from "react";
import { Stage, OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { AvatarParams } from "./VFRViewerWrapper";

interface ModelProps {
  url: string;
  avatarParams?: AvatarParams;
}

function Model({ url, avatarParams }: ModelProps) {
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
    
    console.log("✅ Applied EXTREME transformations - changes should be impossible to miss");
  }, [avatarParams, gltf]);

  return <primitive ref={modelRef} object={gltf.scene} dispose={null} />;
}

interface VFRViewerProps {
  avatarParams?: AvatarParams;
}

export default function VFRViewer({ avatarParams }: VFRViewerProps) {
  return (
    <div className="w-full h-[480px]">
      <Canvas camera={{ position: [0, 1.5, 2.5], fov: 35 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url="/models/mannequin.glb" avatarParams={avatarParams} />
          </Stage>
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}