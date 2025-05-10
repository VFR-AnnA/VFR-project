"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { Stage, OrbitControls, useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

// Configure GLTFLoader with MeshoptDecoder
useGLTF.preload("/models/mannequin.glb");

function Model({ url }: { url: string }) {
  // Use useGLTF instead of useLoader for better handling of compressed models
  const { scene } = useGLTF(url);
  return <primitive object={scene} dispose={null} />;
}

const ASSET_BASE   = "https://vfr-edge.vfravater.workers.dev";
const USE_CLOUDFLARE = true;

export default function VFRViewer() {
  // The model to load
  const modelFile = "mannequin.glb";
  
  // Determine the full URL based on the configuration
  const modelUrl = USE_CLOUDFLARE
    ? `${ASSET_BASE}/${modelFile}`
    : `/models/${modelFile}`;
  
  return (
    <div className="w-full h-[480px]">
      <Canvas camera={{ fov: 35 }} shadows>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url={modelUrl} />
          </Stage>
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
