// lib
import { atom } from "recoil";

export type MeshTreeMaterial = {
  uuid: string;
  name: string;
};

export type MeshTreeNode = {
  uuid: string;
  name: string;
  type: string;
  isMesh: boolean;
  materials: MeshTreeMaterial[];
  children: MeshTreeNode[];
};

export const detailModeEnabledState = atom<boolean>({
  key: "detailModeEnabled",
  default: false,
});

export const meshTreeState = atom<MeshTreeNode | null>({
  key: "meshTree",
  default: null,
});

export const selectedMeshUuidState = atom<string | null>({
  key: "selectedMeshUuid",
  default: null,
});
