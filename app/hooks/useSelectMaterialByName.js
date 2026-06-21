import { useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
  materialsState,
  selectedMaterialNameState,
  materialPropertiesState,
} from "../state/atoms/ModelInfo";

export function useSelectMaterialByName() {
  const materials = useRecoilValue(materialsState);
  const setSelectedMaterialName = useSetRecoilState(selectedMaterialNameState);
  const setMaterialProperties = useSetRecoilState(materialPropertiesState);

  return useCallback(
    (materialName) => {
      const material = materials.find((entry) => entry.name === materialName);
      setSelectedMaterialName(materialName);
      setMaterialProperties({
        roughness: material?.roughness !== undefined ? material.roughness : 0.5,
        metalness: material?.metalness !== undefined ? material.metalness : 0.5,
      });
    },
    [materials, setSelectedMaterialName, setMaterialProperties]
  );
}
