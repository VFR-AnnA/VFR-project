declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Object3D, Scene } from 'three';
  import { Loader } from 'three';

  export class GLTFLoader extends Loader {
    constructor(manager?: any);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }

  export interface GLTF {
    animations: any[];
    scene: Scene;
    scenes: Scene[];
    cameras: any[];
    asset: any;
  }
}