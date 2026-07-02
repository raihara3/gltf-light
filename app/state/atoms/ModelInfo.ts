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

// Polygon count of the model as uploaded, kept as the baseline for reduction.
export const originalPolygonCountState = atom<number>({
  key: "originalPolygonCount",
  default: 0,
});

// Fraction of polygons to preserve (1 = no reduction).
export const polygonReductionRatioState = atom<number>({
  key: "polygonReductionRatio",
  default: 1,
});

// Simplification can break rigged meshes, so surface a warning when present.
export const hasSkinnedMeshState = atom<boolean>({
  key: "hasSkinnedMesh",
  default: false,
});

export const polygonReduceModalOpenState = atom<boolean>({
  key: "polygonReduceModalOpen",
  default: false,
});

// Overlay mesh edges to inspect polygon density, like Blender's edit mode.
export const wireframeOverlayEnabledState = atom<boolean>({
  key: "wireframeOverlayEnabled",
  default: false,
});

// Commands to delete a material or a single texture slot in the Three.js scene.
// The id field ensures the useEffect fires even when the same target is deleted twice.
export const deleteMaterialCommandState = atom<{ materialName: string; id: number } | null>({
  key: "deleteMaterialCommand",
  default: null,
});

export const deleteTextureSlotCommandState = atom<{ materialName: string; slotKey: string; id: number } | null>({
  key: "deleteTextureSlotCommand",
  default: null,
});

export const copyrightState = atom<string>({
  key: "copyright",
  default: "",
});

export const copyrightLockedState = atom<boolean>({
  key: "copyrightLocked",
  default: false,
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

export const updateMaterialProperty = (
  materials: Material[],
  materialName: string,
  property: "roughness" | "metalness",
  value: number
): Material[] => {
  return materials.map((material) => {
    if (material.name === materialName) {
      (material as any)[property] = value;
    }
    return material;
  });
}