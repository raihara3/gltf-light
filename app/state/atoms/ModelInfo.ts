// lib
import { atom } from "recoil";

// types
import { AnimationClip, Material } from "three";
import { TextureType } from "../../classes/GLTFModel";

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