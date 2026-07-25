// Typed message contract between the main thread and the optimize Worker.
// Kept free of store/zustand imports so the Worker bundle stays lean.

export interface PipelineSettings {
  /** prune unused data + dedup duplicates. */
  pruneDedup: boolean;
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
