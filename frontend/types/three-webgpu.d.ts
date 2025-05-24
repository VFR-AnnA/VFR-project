declare module 'three-webgpu' {
  import * as THREE from 'three';

  export class WebGPURenderer extends THREE.WebGLRenderer {
    constructor(parameters?: any);
  }
}