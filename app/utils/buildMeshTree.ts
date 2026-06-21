// states
import type { MeshTreeMaterial, MeshTreeNode } from "../state/atoms/MeshTree";

type MaterialLike = {
  uuid: string;
  name?: string;
};

type ObjectLike = {
  uuid: string;
  name?: string;
  type: string;
  isMesh?: boolean;
  material?: MaterialLike | MaterialLike[];
  children?: ObjectLike[];
};

export const buildMeshTree = (object: ObjectLike | null | undefined): MeshTreeNode | null => {
  if (!object || object.name === "groundPlane") return null;

  const materials: MeshTreeMaterial[] = [];
  if (object.isMesh && object.material) {
    const materialList = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materialList.forEach((material) => {
      materials.push({
        uuid: material.uuid,
        name: material.name || "(unnamed)",
      });
    });
  }

  const children: MeshTreeNode[] = [];
  object.children?.forEach((child) => {
    const childNode = buildMeshTree(child);
    if (childNode) children.push(childNode);
  });

  return {
    uuid: object.uuid,
    name: object.name || object.type,
    type: object.type,
    isMesh: Boolean(object.isMesh),
    materials,
    children,
  };
};
