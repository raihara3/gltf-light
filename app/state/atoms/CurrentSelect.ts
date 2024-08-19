// lib
import { atom } from "recoil";

// types
import { TextureType } from "../../classes/Texture";

export const currentSelectAnimationState = atom<string>({
  key: "currentSelectAnimation",
  default: "",
});

export const currentSelectTextureState = atom<TextureType | {}>({
  key: "currentSelectTexture",
  default: {},
});