/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-06T12:00+02:00  |  SHA256: 3dd4…ab9c
 */

"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Stage, OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url) as { scene: THREE.Group };
  return <primitive object={gltf.scene} dispose={null} />;
}

export default function VFRViewer() {
  return (
    <div className="w-full h-[480px]">
      <Canvas camera={{ position: [0, 1.5, 2.5], fov: 35 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url="/models/mannequin.glb" />
          </Stage>
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}