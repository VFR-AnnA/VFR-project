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
  
  // Log model structure once on load
  useEffect(() => {
    if (modelRef.current) {
      console.log("MODEL STRUCTURE:");
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          console.log(`Mesh name: ${node.name}`);
        } else if (node instanceof THREE.Object3D) {
          console.log(`Object3D name: ${node.name}`);
        }
      });
    }
  }, [gltf]);

  // Apply transformations based on avatar parameters
  useEffect(() => {
    if (modelRef.current && avatarParams) {
      console.log("Applying avatar params:", avatarParams);
      
      // Base scale for the entire model based on height - AMPLIFIED for visibility
      const baseHeightScale = 0.8 + (avatarParams.heightCm - 175) / 175 * 0.4; // More dramatic scaling
      modelRef.current.scale.set(baseHeightScale, baseHeightScale, baseHeightScale);
      
      // Since we don't know the exact mesh names, let's try a more general approach
      // by applying transformations to several mesh segments
      
      let bodyPartFound = false;
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          const name = node.name.toLowerCase();
          console.log(`Applying transformations to mesh: ${name}`);
          
          // Since we don't know exact mesh names, apply proportional scaling to ALL meshes
          // based on their Y position (height) in the model
          
          // Get mesh position in world space
          const worldPosition = new THREE.Vector3();
          node.getWorldPosition(worldPosition);
          
          // Upper body (chest area) - around 60-80% of model height
          if (worldPosition.y > 1.0 && worldPosition.y < 1.5) {
            const chestScaleFactor = 1.0 + (avatarParams.chestCm - 95) / 95 * 0.8; // Amplified by 0.8
            console.log(`Chest area mesh: ${name}, scaling: ${chestScaleFactor}`);
            node.scale.x *= chestScaleFactor;
            node.scale.z *= chestScaleFactor;
            bodyPartFound = true;
          }
          // Middle body (waist area) - around 40-60% of model height
          else if (worldPosition.y > 0.7 && worldPosition.y < 1.0) {
            const waistScaleFactor = 1.0 + (avatarParams.waistCm - 80) / 80 * 0.8; // Amplified by 0.8
            console.log(`Waist area mesh: ${name}, scaling: ${waistScaleFactor}`);
            node.scale.x *= waistScaleFactor;
            node.scale.z *= waistScaleFactor;
            bodyPartFound = true;
          }
          // Lower body (hip area) - around 20-40% of model height
          else if (worldPosition.y > 0.4 && worldPosition.y < 0.7) {
            const hipScaleFactor = 1.0 + (avatarParams.hipCm - 100) / 100 * 0.8; // Amplified by 0.8
            console.log(`Hip area mesh: ${name}, scaling: ${hipScaleFactor}`);
            node.scale.x *= hipScaleFactor;
            node.scale.z *= hipScaleFactor;
            bodyPartFound = true;
          }
        }
      });
      
      console.log("Body parts found and modified:", bodyPartFound);
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