// lib
// import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/Addons.js";
import { AnimationClip, Material } from "three";

// TODO: テクスチャ関連は別クラスに分ける
export interface TextureType {
  src: string;
  name: string;
  width: number;
  height: number;
}

class GLTFModel {
  private filePath: string;
  private loader: GLTFLoader;
  private model: GLTF | null;
  private materials: Material[];

  constructor() {
    this.filePath = "";
    this.loader = new GLTFLoader();
    this.model = null
    this.materials = [];
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
    this.materials = materials;
    return materials;
  }

  getTextures(): TextureType[] {
    if(this.materials.length === 0) {
      this.getMaterials();
    }
    const uniqueNames = new Set<string>();
    const materials = this.materials as any;
    const canvas = document.createElement("canvas");
    return materials.flatMap((material: any) => {
      return Array.from([
        material.map,
        material.normalMap,
        material.roughnessMap,
        material.metalnessMap,
        material.emissiveMap,
        material.aoMap,
        material.displacementMap,
        material.alphaMap,
        material.envMap,
      ]).map((map) => {
        if (!map) return;
        canvas.width = map.image.width;
        canvas.height = map.image.height;
        const ctx2d = canvas.getContext("2d");
        if (!ctx2d) return;
        ctx2d.drawImage(map.image, 0, 0);
        const imageSrc = canvas.toDataURL();
        canvas.remove();
        const name = map.name || "Not named";
        if (uniqueNames.has(name)) return;
        uniqueNames.add(name);
        return {
          src: imageSrc || "",
          name: name,
          width: map.image.width || 0,
          height: map.image.height || 0,
        };
      }).filter(Boolean) as TextureType[];
    });
  }
}

export default GLTFModel;