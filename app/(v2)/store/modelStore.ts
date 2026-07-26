import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Metadata describing the uploaded model (the "Before" side of the
 * optimization summary). `name`/`size` are known immediately on upload;
 * `polygons`/`textures` are filled later once the glb is parsed (Phase 1).
 */
export interface ModelMeta {
  readonly name: string;
  readonly size: number; // byte length of the original glb
  /** From the glb asset (kept for save-time preservation); undefined = none. */
  readonly copyright?: string;
  readonly polygons?: number;
  readonly textures?: readonly ModelTextureMeta[];
  /** Largest texture edge (px) in the original model. */
  readonly maxTextureSize?: number;
}

export interface ModelTextureMeta {
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

interface ModelState {
  /**
   * The original glb bytes — the single source of truth for the whole
   * non-destructive pipeline. IMMUTABLE: this buffer is never written to in
   * place, and no action mutates it. A new upload replaces the reference via
   * `loadModel`; every optimization reads a copy (`slice(0)`) and returns new
   * bytes, so reset/undo is simply "discard the result and reuse the original".
   */
  readonly originalBytes: ArrayBuffer | null;
  readonly meta: ModelMeta | null;
  /** Store a freshly uploaded model. Replaces any previous model. */
  loadModel: (originalBytes: ArrayBuffer, meta: ModelMeta) => void;
  /** Enrich the metadata after parsing (e.g. polygon/texture counts). */
  setMeta: (meta: ModelMeta) => void;
  /** Clear the current model (back to the empty state). */
  clearModel: () => void;
}

export const useModelStore = create<ModelState>()(
  devtools(
    (set) => ({
      originalBytes: null,
      meta: null,
      loadModel: (originalBytes, meta) => set({ originalBytes, meta }, false, "loadModel"),
      setMeta: (meta) => set({ meta }, false, "setMeta"),
      clearModel: () => set({ originalBytes: null, meta: null }, false, "clearModel"),
    }),
    { name: "modelStore" }
  )
);
