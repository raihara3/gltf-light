// PoC (issue #30) — throwaway. Validates @gltf-transform in a Web Worker:
// prune/dedup, in-browser texture resize, copyright preservation.
// NOT part of the production implementation.

type InMsg = { bytes: ArrayBuffer };
type OutMsg =
  | { type: "log"; message: string }
  | { type: "done"; outBytes: ArrayBuffer; summary: Record<string, unknown> }
  | { type: "error"; message: string };

const post = (msg: OutMsg, transfer?: Transferable[]) =>
  (self as unknown as Worker).postMessage(msg, transfer ?? []);
const log = (message: string) => post({ type: "log", message });

self.onmessage = async (event: MessageEvent<InMsg>) => {
  try {
    const { bytes } = event.data;
    log(`received ${bytes.byteLength} bytes`);

    const core = await import("@gltf-transform/core");
    const functions = await import("@gltf-transform/functions");
    log("dynamic import of @gltf-transform/core + functions: OK");

    const io = new core.WebIO();
    const document = await io.readBinary(new Uint8Array(bytes));
    log("WebIO.readBinary: OK");

    const root = document.getRoot();
    const before = {
      meshes: root.listMeshes().length,
      materials: root.listMaterials().length,
      accessors: root.listAccessors().length,
      textures: root.listTextures().length,
    };
    log(`before: ${JSON.stringify(before)}`);

    // copyright preservation (§5.4)
    const asset = root.getAsset();
    asset.copyright = "© 2024 raihara3 (poc)";
    log(`set asset.copyright = "${asset.copyright}"`);

    // 1) prune / dedup (pure JS — expected to work in-browser)
    await document.transform(functions.prune(), functions.dedup());
    const after = {
      meshes: root.listMeshes().length,
      materials: root.listMaterials().length,
      accessors: root.listAccessors().length,
      textures: root.listTextures().length,
    };
    log(`after prune+dedup: ${JSON.stringify(after)}`);
    log(`copyright after transform: "${root.getAsset().copyright}"`);

    // Inject a synthetic PNG texture so textureCompress actually has work to do
    // (test.glb ships without textures).
    const texCanvas = new OffscreenCanvas(256, 256);
    const texCtx = texCanvas.getContext("2d")!;
    texCtx.fillStyle = "#2f6bff";
    texCtx.fillRect(0, 0, 256, 256);
    const texPngBytes = new Uint8Array(
      await (await texCanvas.convertToBlob({ type: "image/png" })).arrayBuffer()
    );
    const texture = document
      .createTexture("poc-texture")
      .setImage(texPngBytes)
      .setMimeType("image/png");
    const material = root.listMaterials()[0] ?? document.createMaterial("poc-material");
    material.setBaseColorTexture(texture);
    log(`injected 256x256 PNG texture (${texPngBytes.byteLength}B)`);

    // 2a) textureCompress WITHOUT a Node encoder — does it work in-browser?
    let textureCompressResult: string;
    const sizeBefore = texture.getSize();
    try {
      await document.transform(functions.textureCompress({ resize: [128, 128] } as never));
      textureCompressResult = `OK — ${JSON.stringify(sizeBefore)}(${texPngBytes.byteLength}B) → ${JSON.stringify(
        texture.getSize()
      )}(${texture.getImage()?.byteLength}B)`;
    } catch (error) {
      textureCompressResult = `threw: ${(error as Error).message}`;
    }
    log(`textureCompress (no encoder, resize 128): ${textureCompressResult}`);

    // 2b) self-implemented OffscreenCanvas + createImageBitmap resize
    let offscreenResult: string;
    try {
      const src = new OffscreenCanvas(1024, 1024);
      const srcCtx = src.getContext("2d")!;
      srcCtx.fillStyle = "#ff5b1d";
      srcCtx.fillRect(0, 0, 1024, 1024);
      const srcBlob = await src.convertToBlob({ type: "image/png" });
      const bitmap = await createImageBitmap(srcBlob);
      const dst = new OffscreenCanvas(512, 512);
      dst.getContext("2d")!.drawImage(bitmap, 0, 0, 512, 512);
      const outBlob = await dst.convertToBlob({ type: "image/png" });
      offscreenResult = `OK — 1024²(${srcBlob.size}B) → 512²(${outBlob.size}B) PNG`;
    } catch (error) {
      offscreenResult = `threw: ${(error as Error).message}`;
    }
    log(`OffscreenCanvas resize: ${offscreenResult}`);

    // 3) write back out
    const outBytes = (await io.writeBinary(document)).slice().buffer as ArrayBuffer;
    log(`WebIO.writeBinary: OK (${outBytes.byteLength} bytes)`);

    post(
      {
        type: "done",
        outBytes,
        summary: {
          before,
          after,
          copyrightPreserved: root.getAsset().copyright === "© 2024 raihara3 (poc)",
          textureCompressResult,
          offscreenResult,
          inBytes: bytes.byteLength,
          outBytes: outBytes.byteLength,
        },
      },
      [outBytes]
    );
  } catch (error) {
    post({ type: "error", message: (error as Error).stack ?? String(error) });
  }
};
