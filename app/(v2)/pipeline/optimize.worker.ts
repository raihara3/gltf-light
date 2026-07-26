// Optimization Worker: runs the non-destructive @gltf-transform pipeline off the
// main thread. gltf-transform is dynamically imported (kept out of the main
// bundle). Input is a copy of the original bytes; output is fresh bytes.
import type { Document } from "@gltf-transform/core";
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

/**
 * Downscale textures whose longest edge exceeds a max, in place. In per-texture
 * mode (`overrides` set) each texture uses its own target (keyed by name; absent
 * = keep); otherwise every texture uses the global `maxSize`.
 */
async function downscaleTextures(
  document: Document,
  settings: Pick<PipelineSettings, "textureMaxSize" | "perTexture" | "textureOverrides">
): Promise<void> {
  for (const texture of document.getRoot().listTextures()) {
    const maxSize = settings.perTexture
      ? settings.textureOverrides[texture.getName()]
      : typeof settings.textureMaxSize === "number"
        ? settings.textureMaxSize
        : undefined;
    if (typeof maxSize !== "number") {
      continue; // 変更なし / texture optimization off
    }
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

/**
 * Drop textures marked for deletion (F-10, by name). Disposing a texture
 * detaches it from every material slot that referenced it; prune afterwards
 * removes the now-orphaned image so the file actually shrinks. Returns true when
 * anything was deleted.
 */
function deleteTextures(document: Document, names: string[]): boolean {
  if (names.length === 0) {
    return false;
  }
  let deleted = false;
  for (const texture of document.getRoot().listTextures()) {
    if (names.includes(texture.getName())) {
      texture.dispose();
      deleted = true;
    }
  }
  return deleted;
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
    // Non-destructive texture deletion. Prune afterwards to drop the orphaned
    // images — done even if prune/dedup is off, otherwise deletions would not
    // shrink the file.
    const hasDeletions = deleteTextures(document, settings.deletedTextures);
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

    // Downscale texture maps via OffscreenCanvas (the #30 fallback — reliable
    // in-browser, keeps the original encoding so a JPEG stays a JPEG with no PNG
    // bloat). Only textures larger than their target are touched. Runs for both
    // the global max and per-texture ("個別で設定する") modes.
    if (settings.perTexture || typeof settings.textureMaxSize === "number") {
      await downscaleTextures(document, settings);
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
