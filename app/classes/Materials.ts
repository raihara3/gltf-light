// types
import { GLTF } from "three/examples/jsm/Addons.js";
import { Material } from "three";
import { LogType } from "./Logger";

// classes
import Logger from "./Logger";

class ModelMaterial {
  materials: Material[];

  constructor() {
    this.materials = [];
  }

  get(model: GLTF) {
    if(!model) {
      throw new Error("Model is not loaded");
    }

    const materials: Material[] = [];
    model.scene.traverse((child: any) => {
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

  validate() {
    const RECOMENMDED_MATERIAL_COUNT = 5;
    if(this.materials.length > RECOMENMDED_MATERIAL_COUNT) {
      return Logger.log({
        logType: LogType.WARNING,
        message: `A little too much material. May affect performance.(Recommendation is under ${RECOMENMDED_MATERIAL_COUNT})`
      });
    }
    return ""
  }
}

export default ModelMaterial;