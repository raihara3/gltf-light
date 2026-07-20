const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const CHUNK_TYPE_JSON = 0x4e4f534a;
const GLB_HEADER_BYTES = 12;
const CHUNK_HEADER_BYTES = 8;
const JSON_PAD_BYTE = 0x20;

export const injectGlbCopyright = (
  buffer: ArrayBuffer,
  copyright: string,
): ArrayBuffer => {
  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);
  if (magic !== GLB_MAGIC) {
    throw new Error("Invalid GLB: unexpected magic value");
  }
  const version = view.getUint32(4, true);
  if (version !== GLB_VERSION) {
    throw new Error(`Unsupported GLB version: ${version}`);
  }
  const totalLength = view.getUint32(8, true);

  const jsonChunkLength = view.getUint32(GLB_HEADER_BYTES, true);
  const jsonChunkType = view.getUint32(GLB_HEADER_BYTES + 4, true);
  if (jsonChunkType !== CHUNK_TYPE_JSON) {
    throw new Error("Invalid GLB: first chunk is not JSON");
  }

  const jsonStart = GLB_HEADER_BYTES + CHUNK_HEADER_BYTES;
  const jsonBytes = new Uint8Array(buffer, jsonStart, jsonChunkLength);
  const gltf = JSON.parse(new TextDecoder("utf-8").decode(jsonBytes));
  if (!gltf.asset) gltf.asset = {};
  gltf.asset.copyright = copyright;

  const newJsonBytes = new TextEncoder().encode(JSON.stringify(gltf));
  const padLength = (4 - (newJsonBytes.length % 4)) % 4;
  const paddedJsonLength = newJsonBytes.length + padLength;
  const paddedJson = new Uint8Array(paddedJsonLength);
  paddedJson.set(newJsonBytes);
  paddedJson.fill(JSON_PAD_BYTE, newJsonBytes.length);

  const remainingStart = jsonStart + jsonChunkLength;
  const remainingLength = totalLength - remainingStart;
  const remaining = new Uint8Array(buffer, remainingStart, remainingLength);

  const newTotalLength =
    GLB_HEADER_BYTES + CHUNK_HEADER_BYTES + paddedJsonLength + remainingLength;
  const output = new ArrayBuffer(newTotalLength);
  const outputView = new DataView(output);
  const outputBytes = new Uint8Array(output);

  outputView.setUint32(0, GLB_MAGIC, true);
  outputView.setUint32(4, GLB_VERSION, true);
  outputView.setUint32(8, newTotalLength, true);
  outputView.setUint32(GLB_HEADER_BYTES, paddedJsonLength, true);
  outputView.setUint32(GLB_HEADER_BYTES + 4, CHUNK_TYPE_JSON, true);
  outputBytes.set(paddedJson, jsonStart);
  outputBytes.set(remaining, jsonStart + paddedJsonLength);

  return output;
};
