// lib
// import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/Addons.js";
import { AnimationClip } from "three";

class GLTFModel {
  private filePath: string;
  private loader: GLTFLoader;
  private model: GLTF | null;

  constructor() {
    this.filePath = "";
    this.loader = new GLTFLoader();
    this.model = null
  }

  getModel() {
    return this.model;
  }

  load(filePath: string) {
    this.filePath = filePath;
    return new Promise((resolve, reject) => {
      this.loader.load(this.filePath, (gltf: GLTF) => {
        this.model = gltf;
        console.log(gltf)
        resolve(gltf);
      });
    });
  }

  getAnimations(): AnimationClip[] {
    if (this.model) {
      return this.model.animations;
    }
    return [];
  }
}

export default GLTFModel;