import { selector } from 'recoil';
import { fileNameState, filePathState, fileSizeState } from '../atoms/Upload3DModelAtom';
import Upload3DModel from "../../models/Upload3DModel";

export const upload3DModelSelector = selector({
  key: "upload3DModel",
  get: ({ get }) => {
    const name = get(fileNameState);
    const filePath = get(filePathState);
    const fileSize = get(fileSizeState)
    return {
      name,
      filePath,
      fileSize,
    } as Upload3DModel;
  },
  set: ({ set }, newValue) => {
    const update3DModel = newValue as Upload3DModel;
    set(fileNameState, update3DModel.name);
    set(filePathState, update3DModel.filePath);
    set(fileSizeState, update3DModel.fileSize);
  }
});