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
  
  // Apply transformations based on avatar parameters
  useEffect(() => {
    if (modelRef.current && avatarParams) {
      // Base scale for the entire model based on height
      const baseHeightScale = avatarParams.heightCm / 175; // 175cm as baseline
      modelRef.current.scale.set(baseHeightScale, baseHeightScale, baseHeightScale);
      
      // Find body parts by traversing the model
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const name = node.name.toLowerCase();
          
          // Apply specific transformations based on body part names
          // Note: These are example transformations and may need adjustment
          // based on your specific model structure
          if (name.includes("chest") || name.includes("torso")) {
            const chestScale = avatarParams.chestCm / 95; // 95cm as baseline
            node.scale.x = chestScale;
            node.scale.z = chestScale;
          } else if (name.includes("waist") || name.includes("abdomen")) {
            const waistScale = avatarParams.waistCm / 80; // 80cm as baseline
            node.scale.x = waistScale;
            node.scale.z = waistScale;
          } else if (name.includes("hip") || name.includes("pelvis")) {
            const hipScale = avatarParams.hipCm / 100; // 100cm as baseline
            node.scale.x = hipScale;
            node.scale.z = hipScale;
          }
        }
      });
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