// lib
import { atom } from "recoil";

// types
import { AnimationClip, Material } from "three";
import { TextureType } from "../../classes/Texture";

export const animationsState = atom<AnimationClip[]>({
  key: "animations",
  default: [],
});

export const polygonCountState = atom<number>({
  key: "polygonCount",
  default: 0,
});

export const copyrightState = atom<string>({
  key: "copyright",
  default: "",
});

export const copyrightLockedState = atom<boolean>({
  key: "copyrightLocked",
  default: false,
});

export const materialsState = atom<Material[]>({
  key: "materials",
  default: [],
})

export const texturesState = atom<TextureType[]>({
  key: "textures",
  default: [],
})

export const selectedMaterialNameState = atom<string | null>({
  key: "selectedMaterialName",
  default: null,
})

export const materialPropertiesState = atom<{
  roughness: number;
  metalness: number;
}>({
  key: "materialProperties",
  default: {
    roughness: 0.5,
    metalness: 0.5,
  },
})

export const updateMaterialProperty = (
  materials: Material[],
  materialName: string,
  property: "roughness" | "metalness",
  value: number
): Material[] => {
  return materials.map((material) => {
    if (material.name === materialName) {
      (material as any)[property] = value;
    }
    return material;
  });
}