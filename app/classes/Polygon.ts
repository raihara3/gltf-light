// types
import { GLTF } from "three/examples/jsm/Addons.js";
import { Material } from "three";
import { LogType } from "./Logger";

// classes
import Logger from "./Logger";

class Polygon {
  materials: Material[];
  polygonCount: number;

  constructor() {
    this.materials = [];
    this.polygonCount = 0;
  }

  getPolygonCount(model: GLTF) {
    if(!model) {
      throw new Error("Model is not loaded");
    }

    let polygonCount = 0;
    model.scene.traverse((child: any) => {
      if (child.isMesh) {
        const geometry = child.geometry;
        polygonCount += geometry.index.count / 3;
      }
    });
    this.polygonCount = polygonCount;
    return polygonCount;
  }

  validate() {
    const WARNING_COUNT = 100000;
    const ERROR_COUNT = 300000;
    if(this.polygonCount > WARNING_COUNT) {
      return Logger.log({
        logType: LogType.WARNING,
        message: `Too many polygons. It is recommended that unnecessary polygons be reduced.(Recommendation is under ${WARNING_COUNT})`
      });
    }else if(this.polygonCount > ERROR_COUNT) {
      return Logger.log({
        logType: LogType.ERROR,
        message: `Too much polygon. Will affect performance.(Recommendation is under ${ERROR_COUNT})`
      });
    }
    return ""
  }
}

export default Polygon;