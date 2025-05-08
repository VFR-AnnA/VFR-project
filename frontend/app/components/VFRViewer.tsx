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
  // TODO: Replace with your actual Cloudflare Worker URL after deployment
  const workerUrl = "https://vfr-edge.your-subdomain.workers.dev";
  
  return (
    <div className="w-full h-[480px]">
      <Canvas camera={{ fov: 35 }} shadows>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {/* For local development */}
            <Model url="/models/mannequin.glb" />
            
            {/* For production with Cloudflare R2 */}
            {/* <Model url={`${workerUrl}/mannequin.glb`} /> */}
          </Stage>
          <OrbitControls enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}