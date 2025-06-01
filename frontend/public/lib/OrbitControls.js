/**
 * OrbitControls for Three.js
 * This is a placeholder for the actual OrbitControls.js from Three.js examples
 */

(function() {
  'use strict';
  
  if (typeof window.THREE === 'undefined') {
    console.error('THREE is not defined. Make sure to include three.js before OrbitControls.js');
    return;
  }

  // Basic OrbitControls implementation
  window.THREE.OrbitControls = function(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || document;
    
    this.enabled = true;
    this.enableDamping = true;
    this.dampingFactor = 0.05;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.target = new THREE.Vector3();
    
    const scope = this;
    const spherical = new THREE.Spherical();
    const sphericalDelta = new THREE.Spherical();
    
    let scale = 1;
    let panOffset = new THREE.Vector3();
    let zoomChanged = false;
    
    const rotateStart = new THREE.Vector2();
    const rotateEnd = new THREE.Vector2();
    const rotateDelta = new THREE.Vector2();
    
    function getAutoRotationAngle() {
      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }
    
    function getZoomScale() {
      return Math.pow(0.95, scope.zoomSpeed);
    }
    
    function rotateLeft(angle) {
      sphericalDelta.theta -= angle;
    }
    
    function rotateUp(angle) {
      sphericalDelta.phi -= angle;
    }
    
    this.update = function() {
      const offset = new THREE.Vector3();
      const quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
      const quatInverse = quat.clone().invert();
      const lastPosition = new THREE.Vector3();
      const lastQuaternion = new THREE.Quaternion();
      
      return function update() {
        const position = scope.camera.position;
        offset.copy(position).sub(scope.target);
        offset.applyQuaternion(quat);
        spherical.setFromVector3(offset);
        
        if (scope.enableDamping) {
          spherical.theta += sphericalDelta.theta * scope.dampingFactor;
          spherical.phi += sphericalDelta.phi * scope.dampingFactor;
        } else {
          spherical.theta += sphericalDelta.theta;
          spherical.phi += sphericalDelta.phi;
        }
        
        spherical.phi = Math.max(0, Math.min(Math.PI, spherical.phi));
        spherical.makeSafe();
        spherical.radius *= scale;
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
        
        scope.target.add(panOffset);
        offset.setFromSpherical(spherical);
        offset.applyQuaternion(quatInverse);
        position.copy(scope.target).add(offset);
        scope.camera.lookAt(scope.target);
        
        if (scope.enableDamping === true) {
          sphericalDelta.theta *= (1 - scope.dampingFactor);
          sphericalDelta.phi *= (1 - scope.dampingFactor);
          panOffset.multiplyScalar(1 - scope.dampingFactor);
        } else {
          sphericalDelta.set(0, 0, 0);
          panOffset.set(0, 0, 0);
        }
        
        scale = 1;
        
        if (zoomChanged ||
          lastPosition.distanceToSquared(scope.camera.position) > 0.000001 ||
          8 * (1 - lastQuaternion.dot(scope.camera.quaternion)) > 0.000001) {
          lastPosition.copy(scope.camera.position);
          lastQuaternion.copy(scope.camera.quaternion);
          zoomChanged = false;
          return true;
        }
        return false;
      };
    }();
    
    this.dispose = function() {
      scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
      scope.domElement.removeEventListener('mousedown', onMouseDown, false);
      scope.domElement.removeEventListener('wheel', onMouseWheel, false);
      scope.domElement.removeEventListener('touchstart', onTouchStart, false);
      scope.domElement.removeEventListener('touchend', onTouchEnd, false);
      scope.domElement.removeEventListener('touchmove', onTouchMove, false);
    };
    
    function onMouseDown(event) {
      if (scope.enabled === false) return;
      event.preventDefault();
      
      if (event.button === 0) {
        rotateStart.set(event.clientX, event.clientY);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
      }
    }
    
    function onMouseMove(event) {
      if (scope.enabled === false) return;
      event.preventDefault();
      
      rotateEnd.set(event.clientX, event.clientY);
      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed || 1);
      
      const element = scope.domElement;
      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);
      rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
      rotateStart.copy(rotateEnd);
      scope.update();
    }
    
    function onMouseUp(event) {
      if (scope.enabled === false) return;
      document.removeEventListener('mousemove', onMouseMove, false);
      document.removeEventListener('mouseup', onMouseUp, false);
    }
    
    function onMouseWheel(event) {
      if (scope.enabled === false || scope.enableZoom === false) return;
      event.preventDefault();
      event.stopPropagation();
      
      if (event.deltaY < 0) {
        scale /= getZoomScale();
      } else if (event.deltaY > 0) {
        scale *= getZoomScale();
      }
      
      scope.update();
      zoomChanged = true;
    }
    
    function onTouchStart(event) {
      if (scope.enabled === false) return;
      event.preventDefault();
    }
    
    function onTouchMove(event) {
      if (scope.enabled === false) return;
      event.preventDefault();
      event.stopPropagation();
    }
    
    function onTouchEnd(event) {
      if (scope.enabled === false) return;
    }
    
    function onContextMenu(event) {
      if (scope.enabled === false) return;
      event.preventDefault();
    }
    
    scope.domElement.addEventListener('contextmenu', onContextMenu, false);
    scope.domElement.addEventListener('mousedown', onMouseDown, false);
    scope.domElement.addEventListener('wheel', onMouseWheel, false);
    scope.domElement.addEventListener('touchstart', onTouchStart, false);
    scope.domElement.addEventListener('touchend', onTouchEnd, false);
    scope.domElement.addEventListener('touchmove', onTouchMove, false);
    
    this.update();
  };
})();