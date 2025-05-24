'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import styles from './styles.module.css';

interface PBRViewerProps {
  modelUrl: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

// Preload the fallback model to ensure it's always available
useGLTF.preload('/models/mannequin.glb');

function Model({ url, crossOrigin }: { url: string; crossOrigin?: string }) {
  const [modelUrl, setModelUrl] = useState(url);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // For demo/placeholder purposes, use a fallback model if the URL is from example.com
  useEffect(() => {
    if (url.includes('example.com')) {
      setModelUrl('/models/mannequin.glb');
    } else {
      console.log('Attempting to load model from URL:', url);
      setModelUrl(url);
      // Reset error state when URL changes
      setHasError(false);
      setErrorMessage('');
      setRetryCount(0);
      setUseFallback(false);
      setIsLoading(true);
    }
  }, [url]);
  
  // Retry loading after a delay with exponential backoff
  useEffect(() => {
    if (hasError && retryCount < 3 && !useFallback) {
      // Exponential backoff: 3s, 6s, 12s
      const delay = 3000 * Math.pow(2, retryCount);
      console.log(`Retrying model load (${retryCount + 1}/3) after ${delay/1000}s delay...`);
      
      const timer = setTimeout(() => {
        // Force a reload by temporarily setting to empty and back
        setModelUrl('');
        setTimeout(() => {
          console.log(`Attempting retry ${retryCount + 1} for URL:`, url);
          setModelUrl(url);
          setIsLoading(true);
        }, 100);
        setRetryCount(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (hasError && retryCount >= 3 && !useFallback) {
      console.error('Max retries reached, using fallback model. Last error:', errorMessage);
      setUseFallback(true);
    }
  }, [hasError, retryCount, url, useFallback, errorMessage]);
  
  // Log the URL being used
  useEffect(() => {
    console.log('PBRViewer attempting to load model from:', modelUrl || url);
  }, [modelUrl, url]);

  // Load the model with error handling and fallback
  const { scene } = useGLTF(
    modelUrl || url,
    '/models/mannequin.glb', // Local fallback model to use if loading fails
    undefined, // draco decoder path (undefined = default)
    (error) => {
      console.error('Error loading 3D model from URL:', modelUrl, error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown loading error';
      console.error('Detailed error:', errorMsg);
      setErrorMessage(errorMsg);
      setHasError(true);
      setIsLoading(false);
    }
  );
  
  // Set loading to false when scene is loaded
  useEffect(() => {
    if (scene) {
      console.log('Model loaded successfully from URL:', modelUrl);
      setIsLoading(false);
    }
  }, [scene, modelUrl]);
  
  // If using fallback after errors
  if (useFallback) {
    return (
      <>
        <Text
          color="red"
          anchorX="center"
          anchorY="middle"
          position={[0, 1.8, 0]}
          fontSize={0.15}
        >
          Error loading model
        </Text>
        <Text
          color="white"
          anchorX="center"
          anchorY="middle"
          position={[0, 1.5, 0]}
          fontSize={0.1}
          maxWidth={2}
        >
          {errorMessage}
        </Text>
        <Text
          color="white"
          anchorX="center"
          anchorY="middle"
          position={[0, 1.2, 0]}
          fontSize={0.12}
        >
          Using fallback model after failed retries
        </Text>
        <primitive object={useGLTF('/models/mannequin.glb').scene} position={[0, 0, 0]} />
      </>
    );
  }
  
  // If there's an error but still retrying
  if (hasError && !useFallback) {
    return (
      <>
        <Text
          color="orange"
          anchorX="center"
          anchorY="middle"
          position={[0, 0.3, 0]}
          fontSize={0.15}
        >
          Loading error
        </Text>
        <Text
          color="white"
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0]}
          fontSize={0.1}
          maxWidth={2}
        >
          {errorMessage}
        </Text>
        <Text
          color="white"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.3, 0]}
          fontSize={0.12}
        >
          {retryCount < 3 ? `Retrying (${retryCount}/3)...` : 'Preparing fallback...'}
        </Text>
      </>
    );
  }
  
  // If still loading
  if (isLoading && !scene) {
    return (
      <Text
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={0.2}
      >
        Loading model...
      </Text>
    );
  }
  
  // Center model in scene
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      
      // Reset model position to center
      scene.position.x = -center.x;
      scene.position.y = -center.y;
      scene.position.z = -center.z;
    }
  }, [scene]);
  
  if (!scene) {
    return (
      <Text
        color="white"
        anchorX="center"
        anchorY="middle"
        fontSize={0.2}
      >
        Loading model...
      </Text>
    );
  }
  
  return <primitive object={scene} dispose={null} />;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="text-white">Loading model...</div>
    </Html>
  );
}

export default function PBRViewer({
  modelUrl,
  width = 400,
  height = 300,
  backgroundColor = '#f0f4f8',
  crossOrigin = 'anonymous'
}: PBRViewerProps) {
  return (
    <div className={styles.container}>
      <Canvas
        className={styles.canvas}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: backgroundColor }}
        gl={{
          // Set attributes for the WebGL context
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<LoadingSpinner />}>
          <Model url={modelUrl} crossOrigin={crossOrigin} />
          <Environment preset="city" />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={1.5}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}