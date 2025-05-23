// lib
// import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/Addons.js";
import { AnimationClip, Material } from "three";

// types
import { Log } from "./Logger";

// classes
import ModelMaterial from "./Materials";
import Polygon from "./Polygon";
import Texture from "./Texture";

class GLTFModel {
  private filePath: string;
  private loader: GLTFLoader;
  private model: GLTF | null;
  private modelMaterial: ModelMaterial;
  private polygon: Polygon;
  private texture: Texture;

  constructor() {
    this.filePath = "";
    this.loader = new GLTFLoader();
    this.model = null

    this.modelMaterial = new ModelMaterial();
    this.polygon = new Polygon();
    this.texture = new Texture();
  }

  getModel() {
    return this.model;
  }

  load(filePath: string) {
    this.filePath = filePath;
    return new Promise((resolve, reject) => {
      this.loader.load(this.filePath, (gltf: GLTF) => {
        this.model = gltf;
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
    if(!this.model) return [];
    return this.modelMaterial.get(this.model);
  }

  getPolygonCount() {
    if(!this.model) return 0;
    return this.polygon.getPolygonCount(this.model);
  }

  getTextures(materials: Material[]) {
    if(materials.length === 0) return []
    return this.texture.get(materials);
  }

  async validate() {
    const logs = [] as Log[];
    const materialLogs = this.modelMaterial.validate();
    if(materialLogs.length > 0) {
      logs.push(...materialLogs);
    }
    const polygonLog = this.polygon.validate();
    if(polygonLog.length > 0) {
      logs.push(...polygonLog);
    }
    const textureLogs = await this.texture.validate();
    if(textureLogs.length > 0) {
      logs.push(...textureLogs);
    }

    return logs;
  }
}

export default GLTFModel;