// ClothingManager.js - Manages clothing layers for the 3D avatar
export class ClothingManager {
  constructor(avatarRoot, loader) {
    this.avatarRoot = avatarRoot;
    this.loader = loader;
    this.layers = new Map();
    this.currentClothing = null;
    
    // Clothing paths mapping
    this.CLOTHES = {
      none: null,
      hoodie: '/models/clothes/hoodie.glb',
      tshirt: '/models/clothes/tshirt.glb'
    };
  }

  async load(name, url) {
    try {
      const gltf = await new Promise((resolve, reject) => {
        this.loader.load(
          url,
          (gltf) => resolve(gltf),
          (progress) => console.log(`Loading ${name}: ${(progress.loaded / progress.total * 100).toFixed(0)}%`),
          (error) => reject(error)
        );
      });
      
      const obj = gltf.scene;
      obj.visible = false;
      obj.name = name;
      
      // Ensure proper shadows and fix black block issue
      obj.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Fix black block issue with transparency
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.transparent = true;
                mat.depthWrite = false;
                mat.side = THREE.DoubleSide;
              });
            } else {
              child.material.transparent = true;
              child.material.depthWrite = false;
              child.material.side = THREE.DoubleSide;
            }
          }
        }
      });
      
      this.avatarRoot.add(obj);
      this.layers.set(name, obj);
      console.log(`Loaded clothing: ${name}`);
    } catch (error) {
      console.error(`Failed to load ${name}:`, error);
    }
  }

  show(name) {
    // Hide all clothing layers
    this.layers.forEach((obj) => {
      obj.visible = false;
    });
    
    // Show selected clothing
    const chosen = this.layers.get(name);
    if (chosen) {
      chosen.visible = true;
      this.currentClothing = name;
      console.log(`Showing clothing: ${name}`);
    } else if (name === 'none') {
      this.currentClothing = null;
      console.log('Hiding all clothing');
    }
  }

  setColor(hex) {
    // Change color of current clothing item
    if (this.currentClothing) {
      const clothing = this.layers.get(this.currentClothing);
      if (clothing) {
        clothing.traverse((child) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.color) mat.color.set(hex);
              });
            } else {
              if (child.material.color) child.material.color.set(hex);
            }
          }
        });
        console.log(`Changed ${this.currentClothing} color to ${hex}`);
      }
    }
    
    // Also change body mesh color if it exists
    const bodyMesh = this.avatarRoot.getObjectByName('BodyMesh');
    if (bodyMesh && bodyMesh.material && bodyMesh.material.color) {
      bodyMesh.material.color.set(hex);
    }
  }

  // Get list of available clothing
  getAvailable() {
    return Array.from(this.layers.keys());
  }

  // Check if clothing is loaded
  has(name) {
    return this.layers.has(name);
  }
  
  // Dispose of a specific clothing item to free GPU memory
  disposeClothing(name) {
    const clothing = this.layers.get(name);
    if (clothing) {
      clothing.traverse((child) => {
        if (child.isMesh) {
          // Dispose geometry
          if (child.geometry) {
            child.geometry.dispose();
          }
          
          // Dispose materials
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => this.disposeMaterial(mat));
            } else {
              this.disposeMaterial(child.material);
            }
          }
        }
      });
      
      // Remove from scene and map
      if (clothing.parent) {
        clothing.parent.remove(clothing);
      }
      this.layers.delete(name);
      console.log(`Disposed clothing: ${name}`);
    }
  }
  
  // Helper to dispose material and its textures
  disposeMaterial(material) {
    if (!material) return;
    
    // Dispose textures
    const textureProperties = [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap',
      'aoMap', 'emissiveMap', 'alphaMap', 'envMap'
    ];
    
    textureProperties.forEach(prop => {
      if (material[prop]) {
        material[prop].dispose();
      }
    });
    
    // Dispose the material itself
    material.dispose();
  }
  
  // Dispose all clothing items
  disposeAll() {
    const names = Array.from(this.layers.keys());
    names.forEach(name => this.disposeClothing(name));
    this.currentClothing = null;
  }
  
  // Load clothing items from predefined paths
  async loadPredefinedClothes() {
    const loadPromises = [];
    
    for (const [name, path] of Object.entries(this.CLOTHES)) {
      if (path && !this.has(name)) {
        loadPromises.push(
          this.load(name, path).catch(err => {
            console.warn(`Failed to load ${name}: ${err.message}`);
          })
        );
      }
    }
    
    await Promise.all(loadPromises);
    console.log('All predefined clothes loaded');
  }
  
  // Get current clothing mesh for external manipulation
  getCurrentMesh() {
    if (this.currentClothing) {
      return this.layers.get(this.currentClothing);
    }
    return null;
  }
}

// Export helper functions for external UI
export function setGarmentColor(hex) {
  if (window.clothingManager) {
    window.clothingManager.setColor(hex);
  }
}

export function setBodyType(type, mannequin) {
  if (!mannequin) return;
  
  // Scale factors for different body types
  const scales = {
    athletic: { x: 1.05, y: 1.0, z: 1.05 },
    average: { x: 1.0, y: 1.0, z: 1.0 },
    curvy: { x: 0.95, y: 1.0, z: 1.1 }
  };
  
  const scale = scales[type] || scales.average;
  mannequin.scale.set(scale.x, scale.y, scale.z);
  mannequin.updateMatrix();
}

// Make functions globally available
if (typeof window !== 'undefined') {
  window.VFR = window.VFR || {};
  window.VFR.setGarmentColor = setGarmentColor;
  window.VFR.setBodyType = setBodyType;
}