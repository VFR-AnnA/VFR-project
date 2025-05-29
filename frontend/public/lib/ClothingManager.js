// ClothingManager.js - Manages clothing layers for the 3D avatar
export class ClothingManager {
  constructor(avatarRoot, loader) {
    this.avatarRoot = avatarRoot;
    this.loader = loader;
    this.layers = new Map();
    this.currentClothing = null;
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
      
      // Ensure proper shadows
      obj.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
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
}