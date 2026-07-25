// Typed message contract between the main thread and the optimize Worker.
// Kept free of store/zustand imports so the Worker bundle stays lean.

/** Max texture edge length; `"off"` disables texture downscaling. */
export type TextureMaxSize = 2048 | 1024 | 512 | "off";

export interface PipelineSettings {
  /** prune unused data + dedup duplicates. */
  pruneDedup: boolean;
  /** Downscale every texture map to this max edge; `"off"` keeps them. */
  textureMaxSize: TextureMaxSize;
  /** Polygon reduction (meshoptimizer simplify) — OFF by default. */
  reduce: {
    enabled: boolean;
    /** Target ratio of triangles to keep (0–1). */
    ratio: number;
  };
}

export interface PipelineStats {
  /** Byte length of the output glb. */
  size: number;
  polygons: number;
  textures: number;
  /** Number of unused properties removed by prune. */
  unusedRemoved: number;
}

export interface PipelineRequest {
  id: number;
  bytes: ArrayBuffer;
  settings: PipelineSettings;
}

export type PipelineResponse =
  | { id: number; type: "result"; outBytes: ArrayBuffer; stats: PipelineStats }
  | { id: number; type: "error"; message: string };
