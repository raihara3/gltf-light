// types
import { Material } from "three";
import { LogType, Log } from "./Logger";

// classes
import Logger from "./Logger";

export interface TextureType {
  src: string;
  name: string;
  width: number;
  height: number;
}

class Texture {
  textures: TextureType[];

  constructor() {
    this.textures = [];
  }

  get(materials: Material[]) {
    if(!materials) {
      throw new Error("Materials are not loaded");
    }

    const uniqueUuIds = new Set<string>();
    const canvas = document.createElement("canvas");
    const textures = materials.flatMap((material: any) => {
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
        if (uniqueUuIds.has(map.uuid)) return;
        uniqueUuIds.add(map.uuid);
        return {
          src: imageSrc || "",
          name: name,
          width: map.image.width || 0,
          height: map.image.height || 0,
        };
      }).filter(Boolean) as TextureType[];
    });
    this.textures = textures;
    return this.textures;
  }

  async validate(): Promise<Log[]> {
    const WARNING_SIZE = 4096;
    const ERROR_SIZE = 8192;

    const logs = [] as Log[];
    await this.textures.forEach(texture => {
      if(texture.width > WARNING_SIZE || texture.height > WARNING_SIZE) {
        logs.push(Logger.log({
          logType: LogType.WARNING,
          message: `${texture.name} texture size is a little large. May affect performance.(Recommendation is under ${WARNING_SIZE.toLocaleString()}px)`
        }));
      }else if(texture.width >= ERROR_SIZE || texture.height >= ERROR_SIZE) {
        logs.push(Logger.log({
          logType: LogType.ERROR,
          message: `${texture.name} texture size is too large. More than ${ERROR_SIZE.toLocaleString()}px may cause safari to crash.(Recommendation is under ${WARNING_SIZE.toLocaleString()}px)`
        }));
      }
    })
    return logs
  }
}

export default Texture;