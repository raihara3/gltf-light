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

export const animationPlayingState = atom<boolean>({
  key: "animationPlaying",
  default: true,
});

export const animationCurrentTimeState = atom<number>({
  key: "animationCurrentTime",
  default: 0,
});

export const animationSeekTimeState = atom<number | null>({
  key: "animationSeekTime",
  default: null,
});

export const animationDurationState = atom<number>({
  key: "animationDuration",
  default: 0,
});
