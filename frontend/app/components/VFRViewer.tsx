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

export default function VFRViewer() {
  return (
    <div className="w-full h-[480px]">
      <Canvas camera={{ fov: 35 }} shadows>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url="/models/mannequin.glb" />
            {/* Replace the URL above with your actual Cloudflare Worker endpoint when ready */}
            {/* Example: https://vfr-edge.your-subdomain.workers.dev/mannequin.glb */}
          </Stage>
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}