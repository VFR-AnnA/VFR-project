/**
 * ClothingManager - Manages 3D clothing models and mannequin
 */

(function() {
  'use strict';
  
  if (typeof window.THREE === 'undefined') {
    console.error('THREE is not defined. Make sure to include three.js before ClothingManager.js');
    return;
  }

  window.ClothingManager = function(scene) {
    this.scene = scene;
    this.mannequin = null;
    this.clothing = null;
    this.loader = new THREE.GLTFLoader();
    
    // Default materials
    this.defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.7,
      metalness: 0.3
    });
  };

  ClothingManager.prototype.loadMannequin = function(url) {
    const self = this;
    
    return new Promise((resolve, reject) => {
      self.loader.load(
        url,
        function(gltf) {
          // Remove existing mannequin
          if (self.mannequin) {
            self.scene.remove(self.mannequin);
          }
          
          self.mannequin = gltf.scene;
          
          // Apply default material to mannequin
          self.mannequin.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xf0e6d2,
                roughness: 0.8,
                metalness: 0.1
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          // Center and scale mannequin
          const box = new THREE.Box3().setFromObject(self.mannequin);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2 / maxDim;
          
          self.mannequin.scale.multiplyScalar(scale);
          self.mannequin.position.sub(center.multiplyScalar(scale));
          self.mannequin.position.y = -1;
          
          self.scene.add(self.mannequin);
          resolve(self.mannequin);
        },
        function(xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
          console.error('Error loading mannequin:', error);
          reject(error);
        }
      );
    });
  };

  ClothingManager.prototype.loadClothing = function(url, color) {
    const self = this;
    
    return new Promise((resolve, reject) => {
      self.loader.load(
        url,
        function(gltf) {
          // Remove existing clothing
          if (self.clothing) {
            self.scene.remove(self.clothing);
          }
          
          self.clothing = gltf.scene;
          
          // Apply color to clothing
          const clothingColor = new THREE.Color(color || '#0066cc');
          
          self.clothing.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: clothingColor,
                roughness: 0.6,
                metalness: 0.2,
                side: THREE.DoubleSide
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          // Position clothing relative to mannequin
          if (self.mannequin) {
            const mannequinBox = new THREE.Box3().setFromObject(self.mannequin);
            const clothingBox = new THREE.Box3().setFromObject(self.clothing);
            
            const mannequinCenter = mannequinBox.getCenter(new THREE.Vector3());
            const clothingCenter = clothingBox.getCenter(new THREE.Vector3());
            
            self.clothing.position.copy(mannequinCenter).sub(clothingCenter);
            self.clothing.position.y += 0.1; // Slight offset to prevent z-fighting
          }
          
          self.scene.add(self.clothing);
          resolve(self.clothing);
        },
        function(xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
          console.error('Error loading clothing:', error);
          reject(error);
        }
      );
    });
  };

  ClothingManager.prototype.changeClothingColor = function(color) {
    if (!this.clothing) return;
    
    const newColor = new THREE.Color(color);
    
    this.clothing.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color = newColor;
      }
    });
  };

  ClothingManager.prototype.removeClothing = function() {
    if (this.clothing) {
      this.scene.remove(this.clothing);
      this.clothing = null;
    }
  };

  ClothingManager.prototype.dispose = function() {
    this.removeClothing();
    
    if (this.mannequin) {
      this.scene.remove(this.mannequin);
      this.mannequin = null;
    }
  };

})();