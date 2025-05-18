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

  // Apply transformations with EXTREME exaggeration for demo visibility
  useEffect(() => {
    if (modelRef.current && avatarParams) {
      console.log("Applying avatar params with EXTREME EXAGGERATION:", avatarParams);
      
      // Apply MASSIVELY exaggerated transformations instead of trying to be anatomically realistic
      // We'll distort the model dramatically to make changes super obvious
      
      // 1. Calculate extreme scaling factors (massive exaggeration)
      const heightDelta = avatarParams.heightCm - 175; // Difference from default
      const chestDelta = avatarParams.chestCm - 95;    // Difference from default
      const waistDelta = avatarParams.waistCm - 80;    // Difference from default
      const hipDelta = avatarParams.hipCm - 100;       // Difference from default
      
      // 2. Extremely amplify these deltas for dramatic visual effect
      const heightFactor = 1.0 + (heightDelta / 50);     // 50 cm change = 2x size
      const chestFactor = 1.0 + (chestDelta / 15) * 2;   // 15 cm change = 3x width
      const waistFactor = 1.0 + (waistDelta / 20) * 2;   // 20 cm change = 3x depth
      const hipFactor = 1.0 + (hipDelta / 20) * 2;       // 20 cm change = 3x depth
      
      console.log(`Applied EXTREMELY EXAGGERATED scaling:
        Height: ${heightFactor.toFixed(2)}
        Chest: ${chestFactor.toFixed(2)}
        Waist: ${waistFactor.toFixed(2)}
        Hip: ${hipFactor.toFixed(2)}`);
      
      // Apply dramatic non-uniform scaling to the ENTIRE model
      // This will create visibly obvious changes when sliders move
      modelRef.current.scale.set(
        chestFactor,    // Width (X) - controlled by chest measurement
        heightFactor,   // Height (Y) - controlled by height measurement
        (waistFactor + hipFactor) / 2  // Depth (Z) - combined waist/hip effect
      );
      
      // For even more dramatic effect, apply some tilt
      // When measurements differ a lot, the model will visibly lean
      if (Math.abs(chestDelta) > 5 || Math.abs(hipDelta) > 5) {
        // Create a visible tilt effect based on chest vs hip difference
        const tiltAmount = (chestDelta - hipDelta) / 100;
        modelRef.current.rotation.z = tiltAmount;
        console.log(`Applied tilt effect: ${tiltAmount.toFixed(2)} radians`);
      }
      
      console.log("Applied EXTREME transformations to make changes obvious");
    }
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