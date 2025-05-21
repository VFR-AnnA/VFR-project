"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

function SimpleModel() {
  return (
    <group position={[0, 0, 0]}>
      {/* Mannequin representation using basic shapes */}
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[0.7, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[-0.7, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <capsuleGeometry args={[0.15, 0.8, 8, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.3, -1, 0]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.2, 1, 8, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[-0.3, -1, 0]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.2, 1, 8, 16]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
    </group>
  );
}

interface SimpleVFRViewerProps {
  height?: string;
}

export default function SimpleVFRViewer({ height = "400px" }: SimpleVFRViewerProps) {
  return (
    <div 
      style={{ 
        width: '100%', 
        height: height, 
        background: '#1a1a1a', 
        overflow: 'hidden', 
        position: 'relative',
        border: '2px solid #8b5cf6'
      }} 
      className="mx-auto canvas-wrapper"
    >
      <Canvas
        camera={{
          position: [0, 0, 4],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ width: '100%', height: '100%', position: 'absolute' }}
      >
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
        />
        <pointLight position={[-5, 5, 5]} intensity={1} color="white" />
        
        <Suspense fallback={null}>
          <SimpleModel />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}