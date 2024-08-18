// lib
import { atom } from "recoil";

export const currentSelectAnimationState = atom<string>({
  key: "currentSelectAnimation",
  default: "",
});