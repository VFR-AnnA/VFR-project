"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense, useCallback } from "react";
import RealisticAvatar from "./RealisticAvatar";
import { DEFAULT_AVATAR_PARAMS, AvatarParams } from "../../types/avatar-params";

// This component will be rendered inside the Canvas and handle the invalidateFrameloop setup
function CanvasSetup() {
  // Set up the window.invalidateFrameloop function using useFrame
  useFrame((state) => {
    if (typeof window !== 'undefined' && !window.invalidateFrameloop) {
      window.invalidateFrameloop = () => {
        state.invalidate();
      };
    }
    return null;
  });
  
  return null;
}

// Add type declaration for window if not already defined
declare global {
  interface Window {
    invalidateFrameloop: () => void;
  }
}

interface SimpleVFRViewerProps {
  height?: string;
  avatarParams?: AvatarParams; // Add avatarParams prop
}

export default function SimpleVFRViewer({ height = "400px", avatarParams = DEFAULT_AVATAR_PARAMS }: SimpleVFRViewerProps) {
  // Create a memoized callback for OrbitControls onChange
  const handleControlsChange = useCallback(() => {
    // Request a single render frame when controls change
    if (typeof window !== 'undefined') {
      if (window.invalidateFrameloop) {
        window.invalidateFrameloop();
      } else {
        // Fallback if invalidateFrameloop is not set yet
        window.dispatchEvent(new CustomEvent('request-render'));
      }
    }
  }, []);

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
        frameloop="demand" // Only render when needed to reduce INP
        camera={{
          position: [0, 0, 4],
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          alpha: true,
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance' // Prefer GPU performance
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, 5]} intensity={1} color="white" />
        
        <CanvasSetup />
        <Suspense fallback={null}>
          {/* Use the RealisticAvatar component instead of SimpleModel */}
          <RealisticAvatar
            avatarParams={avatarParams}
            isPreloaded={false}
            useRealisticModel={true}
          />
          <Environment preset="city" />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={10}
            makeDefault // Ensure controls are properly disposed
            onChange={handleControlsChange}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}