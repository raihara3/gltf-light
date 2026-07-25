// Optimization Worker: runs the non-destructive @gltf-transform pipeline off the
// main thread. gltf-transform is dynamically imported (kept out of the main
// bundle). Input is a copy of the original bytes; output is fresh bytes.
import type { Document, Material } from "@gltf-transform/core";
import type { PipelineRequest, PipelineResponse, PipelineSettings } from "./types";

const worker = self as unknown as Worker;
const post = (message: PipelineResponse, transfer?: Transferable[]) =>
  worker.postMessage(message, transfer ?? []);

/** Total property count across the categories that prune can drop. */
function propertyCount(document: Document): number {
  const root = document.getRoot();
  return (
    root.listAccessors().length +
    root.listTextures().length +
    root.listMaterials().length +
    root.listMeshes().length +
    root.listSkins().length +
    root.listNodes().length
  );
}

/** Downscale every texture whose longest edge exceeds `maxSize`, in place. */
async function downscaleTextures(document: Document, maxSize: number): Promise<void> {
  for (const texture of document.getRoot().listTextures()) {
    const image = texture.getImage();
    const size = texture.getSize();
    const mimeType = texture.getMimeType() || "image/png";
    if (!image || !size) {
      continue;
    }
    const [width, height] = size;
    const longest = Math.max(width, height);
    if (longest <= maxSize) {
      continue;
    }
    const scale = maxSize / longest;
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const bitmap = await createImageBitmap(new Blob([image as BlobPart], { type: mimeType }));
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      continue;
    }
    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const blob = await canvas.convertToBlob(
      mimeType === "image/jpeg" ? { type: "image/jpeg", quality: 0.85 } : { type: mimeType }
    );
    texture.setImage(new Uint8Array(await blob.arrayBuffer()));
  }
}

/** Drop a single texture-map slot from a material. Labels match the preview UI
 *  (`MAP_KEYS` in useThreeStage); Roughness/Metalness share the glTF
 *  metallicRoughness texture, so either removes it. */
function clearTextureSlot(material: Material, slot: string): void {
  switch (slot) {
    case "BaseColor":
      material.setBaseColorTexture(null);
      break;
    case "Normal":
      material.setNormalTexture(null);
      break;
    case "Roughness":
    case "Metalness":
      material.setMetallicRoughnessTexture(null);
      break;
    case "Emissive":
      material.setEmissiveTexture(null);
      break;
    case "AO":
      material.setOcclusionTexture(null);
      break;
  }
}

/**
 * Apply the non-destructive slot/material deletions (F-10). Deleting a material
 * detaches it from every primitive (meshes render blank, as in legacy); prune
 * afterwards drops the now-orphaned materials/textures so the size shrinks.
 * Returns true when anything was deleted (so the caller can prune even with the
 * prune/dedup toggle off).
 */
function applyDeletions(document: Document, settings: PipelineSettings): boolean {
  const { deletedMaterials, deletedTextureSlots } = settings;
  if (deletedMaterials.length === 0 && deletedTextureSlots.length === 0) {
    return false;
  }
  for (const material of document.getRoot().listMaterials()) {
    const name = material.getName();
    if (deletedMaterials.includes(name)) {
      material.dispose();
      continue;
    }
    for (const { slot } of deletedTextureSlots.filter((entry) => entry.material === name)) {
      clearTextureSlot(material, slot);
    }
  }
  return true;
}

/** Sum of triangles across all mesh primitives. */
function countPolygons(document: Document): number {
  let triangles = 0;
  document
    .getRoot()
    .listMeshes()
    .forEach((mesh) => {
      mesh.listPrimitives().forEach((primitive) => {
        const indices = primitive.getIndices();
        const position = primitive.getAttribute("POSITION");
        const count = indices ? indices.getCount() : position ? position.getCount() : 0;
        triangles += count / 3;
      });
    });
  return Math.round(triangles);
}

worker.onmessage = async (event: MessageEvent<PipelineRequest>) => {
  const { id, bytes, settings } = event.data;
  try {
    const core = await import("@gltf-transform/core");
    const functions = await import("@gltf-transform/functions");

    const io = new core.WebIO();
    const document = await io.readBinary(new Uint8Array(bytes));

    // Preserve asset metadata (copyright) explicitly — §5.4.
    const copyright = document.getRoot().getAsset().copyright;

    const before = propertyCount(document);
    // Non-destructive material/texture-slot deletion (F-10). Prune afterwards to
    // drop orphaned data — done even if prune/dedup is off, otherwise deletions
    // would not shrink the file.
    const hasDeletions = applyDeletions(document, settings);
    if (settings.pruneDedup) {
      await document.transform(functions.prune(), functions.dedup());
    } else if (hasDeletions) {
      await document.transform(functions.prune());
    }
    const after = propertyCount(document);

    // Polygon reduction (meshoptimizer simplify) — only when explicitly enabled.
    if (settings.reduce.enabled) {
      const meshopt = await import("meshoptimizer");
      await meshopt.MeshoptSimplifier.ready;
      await document.transform(
        functions.simplify({
          simplifier: meshopt.MeshoptSimplifier,
          ratio: settings.reduce.ratio,
          // Looser error tolerance so the slider ratio can actually be reached
          // (a tight bound stops simplification early on dense/skinned meshes).
          error: 0.05,
        })
      );
    }

    // Downscale all texture maps to the chosen max edge via OffscreenCanvas
    // (the #30 fallback — reliable in-browser, keeps the original encoding so a
    // JPEG stays a JPEG with no PNG bloat). Only textures larger than the box
    // are touched.
    if (typeof settings.textureMaxSize === "number") {
      await downscaleTextures(document, settings.textureMaxSize);
    }

    if (copyright) {
      document.getRoot().getAsset().copyright = copyright;
    }

    const outArray = await io.writeBinary(document);
    const outBytes = outArray.slice().buffer as ArrayBuffer;

    post(
      {
        id,
        type: "result",
        outBytes,
        stats: {
          size: outBytes.byteLength,
          polygons: countPolygons(document),
          textures: document.getRoot().listTextures().length,
          unusedRemoved: Math.max(0, before - after),
        },
      },
      [outBytes]
    );
  } catch (error) {
    post({ id, type: "error", message: (error as Error).message });
  }
};
