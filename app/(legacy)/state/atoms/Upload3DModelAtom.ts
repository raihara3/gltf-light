// lib
import { atom } from "recoil";

// types
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
