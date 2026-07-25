// Optimization Worker: runs the non-destructive @gltf-transform pipeline off the
// main thread. gltf-transform is dynamically imported (kept out of the main
// bundle). Input is a copy of the original bytes; output is fresh bytes.
import type { Document } from "@gltf-transform/core";
import type { PipelineRequest, PipelineResponse } from "./types";

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
    if (settings.pruneDedup) {
      await document.transform(functions.prune(), functions.dedup());
    }
    const after = propertyCount(document);

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
