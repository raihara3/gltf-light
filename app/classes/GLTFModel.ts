// lib
// import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/Addons.js";
import { AnimationClip, Material } from "three";

class GLTFModel {
  private filePath: string;
  private loader: GLTFLoader;
  private model: GLTF | null;

  constructor() {
    this.filePath = "";
    this.loader = new GLTFLoader();
    this.model = null
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

  getPolygonCount() {
    if(!this.model) return 0;

    let polygonCount = 0;
    this.model.scene.traverse((child: any) => {
      if (child.isMesh) {
        const geometry = child.geometry;
        polygonCount += geometry.index.count / 3;
      }
    });
    return polygonCount;
  }

  getMaterials() {
    if (!this.model) return [];

    const materials: Material[] = [];
    this.model.scene.traverse((child: any) => {
      if (!child.material) return;
      if (Array.isArray(child.material)) {
        materials.push(...child.material.filter((mat: Material) => !materials.includes(mat)));
      } else {
        if (!materials.includes(child.material)) {
          materials.push(child.material);
        }
      }
    });
    return materials;
  }
}

export default GLTFModel;