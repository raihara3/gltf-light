// lib
import { atom } from "recoil";

// types
import { AnimationClip, Material } from "three";
import { TextureType } from "../../classes/GLTFModel";
import Upload3DModel from "../../models/Upload3DModel";

export const fileNameState = atom<Upload3DModel["name"]>({
  key: "fileName",
  default: "",
});

export const filePathState = atom<Upload3DModel["filePath"]>({
  key: "filePath",
  default: "",
});

export const fileSizeState = atom<Upload3DModel["fileSize"]>({
  key: "fileSize",
  default: "",
});

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