export const MATERIAL_TEXTURE_SLOTS = [
  { key: "map", label: "Base Color" },
  { key: "normalMap", label: "Normal" },
  { key: "roughnessMap", label: "Roughness" },
  { key: "metalnessMap", label: "Metalness" },
  { key: "emissiveMap", label: "Emissive" },
  { key: "aoMap", label: "AO" },
  { key: "displacementMap", label: "Displacement" },
  { key: "alphaMap", label: "Alpha" },
];

export const getMaterialTextureUuids = (material) => {
  const uuids = new Set();
  if (!material) return uuids;
  for (const slot of MATERIAL_TEXTURE_SLOTS) {
    const map = material[slot.key];
    if (map && map.uuid) {
      uuids.add(map.uuid);
    }
  }
  return uuids;
};
