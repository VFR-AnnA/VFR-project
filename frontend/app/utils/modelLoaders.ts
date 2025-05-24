/**
 * Avatar-Wallet VFR – Proprietary Source
 * © 2025 Artur Gabrielian. All rights reserved.
 * Build-stamp: 2025-05-21T13:40+02:00
 */

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as THREE from 'three';

// Cache for loaded models
const modelCache = new Map();
const textureCache = new Map();

/**
 * Initialize the Draco loader
 * @returns DRACOLoader instance
 */
export function initDracoLoader(): DRACOLoader {
  const dracoLoader = new DRACOLoader();
  // Use a CDN for the Draco decoder
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder for compatibility
  return dracoLoader;
}

/**
 * Initialize the KTX2 loader
 * @param renderer - THREE.WebGLRenderer instance
 * @returns KTX2Loader instance
 */
export function initKTX2Loader(renderer: THREE.WebGLRenderer): KTX2Loader {
  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/libs/basis/');
  ktx2Loader.detectSupport(renderer);
  return ktx2Loader;
}

/**
 * Initialize the GLTF loader with Draco and KTX2 support
 * @param renderer - THREE.WebGLRenderer instance
 * @returns GLTFLoader instance
 */
export function initGLTFLoader(renderer: THREE.WebGLRenderer): GLTFLoader {
  const dracoLoader = initDracoLoader();
  const ktx2Loader = initKTX2Loader(renderer);
  
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setKTX2Loader(ktx2Loader);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);
  
  return gltfLoader;
}

/**
 * Load a GLTF model with caching
 * @param url - URL of the model
 * @param renderer - THREE.WebGLRenderer instance
 * @returns Promise that resolves to the loaded model
 */
export function loadModel(url: string, renderer: THREE.WebGLRenderer): Promise<THREE.Group> {
  // Check if the model is already cached
  if (modelCache.has(url)) {
    const cachedModel = modelCache.get(url);
    // Return a clone of the cached model to avoid modifying the original
    return Promise.resolve(cachedModel.clone());
  }
  
  // Initialize the loader
  const loader = initGLTFLoader(renderer);
  
  // Load the model
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        // Cache the model
        modelCache.set(url, gltf.scene.clone());
        resolve(gltf.scene);
      },
      (progress) => {
        // Log progress if needed
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Loading model: ${Math.round(progress.loaded / progress.total * 100)}%`);
        }
      },
      (error) => {
        console.error('Error loading model:', error);
        reject(error);
      }
    );
  });
}

/**
 * Preload a model to cache it for later use
 * @param url - URL of the model
 * @param renderer - THREE.WebGLRenderer instance
 * @returns Promise that resolves when the model is loaded
 */
export function preloadModel(url: string, renderer: THREE.WebGLRenderer): Promise<void> {
  if (modelCache.has(url)) {
    return Promise.resolve();
  }
  
  return loadModel(url, renderer).then(() => {
    console.log(`Model preloaded: ${url}`);
  });
}

/**
 * Load a KTX2 texture with caching
 * @param url - URL of the texture
 * @param renderer - THREE.WebGLRenderer instance
 * @returns Promise that resolves to the loaded texture
 */
export function loadKTX2Texture(url: string, renderer: THREE.WebGLRenderer): Promise<THREE.Texture> {
  // Check if the texture is already cached
  if (textureCache.has(url)) {
    return Promise.resolve(textureCache.get(url));
  }
  
  // Initialize the loader
  const loader = initKTX2Loader(renderer);
  
  // Load the texture
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        // Cache the texture
        textureCache.set(url, texture);
        resolve(texture);
      },
      (progress) => {
        // Log progress if needed
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Loading texture: ${Math.round(progress.loaded / progress.total * 100)}%`);
        }
      },
      (error) => {
        console.error('Error loading texture:', error);
        reject(error);
      }
    );
  });
}

/**
 * Apply a texture to a mesh
 * @param mesh - THREE.Mesh to apply the texture to
 * @param texture - THREE.Texture to apply
 * @param textureType - Type of texture (diffuse, normal, etc.)
 */
export function applyTextureToMesh(
  mesh: THREE.Mesh,
  texture: THREE.Texture,
  textureType: 'diffuse' | 'normal' | 'roughness' | 'metalness' | 'ao'
): void {
  if (!mesh.material) {
    console.warn('Mesh has no material');
    return;
  }
  
  // Ensure the material is a MeshStandardMaterial
  if (mesh.material instanceof THREE.MeshStandardMaterial) {
    switch (textureType) {
      case 'diffuse':
        mesh.material.map = texture;
        break;
      case 'normal':
        mesh.material.normalMap = texture;
        break;
      case 'roughness':
        mesh.material.roughnessMap = texture;
        break;
      case 'metalness':
        mesh.material.metalnessMap = texture;
        break;
      case 'ao':
        mesh.material.aoMap = texture;
        break;
    }
    
    // Update the material
    mesh.material.needsUpdate = true;
  } else {
    console.warn('Material is not a MeshStandardMaterial');
  }
}

/**
 * Clear the model and texture caches
 */
export function clearCaches(): void {
  modelCache.clear();
  textureCache.clear();
}