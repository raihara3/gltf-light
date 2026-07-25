// Extract encoded texture byte sizes from a glb, keyed by material name and the
// three.js map type. GLTFLoader decodes images to bitmaps and drops the encoded
// byte length, so we read it back from the glb's JSON chunk (bufferView sizes).

const GLB_MAGIC = 0x46546c67; // "glTF"
const JSON_CHUNK = 0x4e4f534a; // "JSON"

/** glTF texture slot → three.js map-type label(s). Roughness/Metalness share one. */
const SLOTS: { label: string; index: (material: GltfMaterial) => number | undefined }[] = [
  { label: "BaseColor", index: (m) => m.pbrMetallicRoughness?.baseColorTexture?.index },
  { label: "Normal", index: (m) => m.normalTexture?.index },
  { label: "Roughness", index: (m) => m.pbrMetallicRoughness?.metallicRoughnessTexture?.index },
  { label: "Metalness", index: (m) => m.pbrMetallicRoughness?.metallicRoughnessTexture?.index },
  { label: "Emissive", index: (m) => m.emissiveTexture?.index },
  { label: "AO", index: (m) => m.occlusionTexture?.index },
];

interface GltfMaterial {
  name?: string;
  normalTexture?: { index?: number };
  emissiveTexture?: { index?: number };
  occlusionTexture?: { index?: number };
  pbrMetallicRoughness?: {
    baseColorTexture?: { index?: number };
    metallicRoughnessTexture?: { index?: number };
  };
}

interface GltfJson {
  materials?: GltfMaterial[];
  textures?: { source?: number }[];
  images?: { bufferView?: number }[];
  bufferViews?: { byteLength?: number }[];
}

export type MaterialTextureSizes = Map<string, Record<string, number>>;

export function parseGlbTextureSizes(bytes: ArrayBuffer): MaterialTextureSizes {
  const result: MaterialTextureSizes = new Map();
  try {
    const view = new DataView(bytes);
    if (view.byteLength < 12 || view.getUint32(0, true) !== GLB_MAGIC) {
      return result;
    }
    let offset = 12;
    let json: GltfJson | null = null;
    while (offset + 8 <= view.byteLength) {
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      if (chunkType === JSON_CHUNK) {
        const chunk = new Uint8Array(bytes, offset + 8, chunkLength);
        json = JSON.parse(new TextDecoder().decode(chunk)) as GltfJson;
        break;
      }
      offset += 8 + chunkLength;
    }
    if (!json?.materials) {
      return result;
    }

    const imageBytes = (textureIndex: number | undefined): number => {
      if (textureIndex == null) {
        return 0;
      }
      const source = json.textures?.[textureIndex]?.source;
      const bufferView = source != null ? json.images?.[source]?.bufferView : undefined;
      return bufferView != null ? json.bufferViews?.[bufferView]?.byteLength ?? 0 : 0;
    };

    json.materials.forEach((material) => {
      if (!material.name) {
        return;
      }
      const sizes: Record<string, number> = {};
      SLOTS.forEach(({ label, index }) => {
        const bytesLength = imageBytes(index(material));
        if (bytesLength > 0) {
          sizes[label] = bytesLength;
        }
      });
      result.set(material.name, sizes);
    });
  } catch {
    // Non-standard glb — sizes just stay unavailable.
  }
  return result;
}
