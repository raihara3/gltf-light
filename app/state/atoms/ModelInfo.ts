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