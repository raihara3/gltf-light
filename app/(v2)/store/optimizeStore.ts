import { create } from "zustand";
import { devtools } from "zustand/middleware";

/** Max texture edge length; `"off"` disables texture downscaling. */
export type TextureMaxSize = 2048 | 1024 | 512 | "off";

/** Pipeline status. Worker execution is wired up in Phase 1. */
export type OptimizeStatus = "idle" | "estimating" | "transforming" | "ready" | "error";

export interface OptimizeSettings {
  /** prune unused data + dedup (safe, applied by default). */
  pruneDedup: boolean;
  textureMaxSize: TextureMaxSize;
  /** "個別で設定する": drive downscaling per texture instead of the global max. */
  perTexture: boolean;
  /** texture name → target max edge (px). Absence means "変更なし" (keep). */
  textureOverrides: Record<string, number>;
  /** Polygon reduction — OFF by default; requires explicit user action. */
  reduce: {
    enabled: boolean;
    ratio: number; // kept ratio, 0..1
  };
}

/** F-17 auto-estimation result. `null` in the store means "not estimated yet". */
export interface OptimizeEstimate {
  afterBytes: number;
  deltaPct: number;
}

/** Result of a transform run. `bytes` are new — the original is never touched. */
export interface OptimizeResult {
  bytes?: ArrayBuffer;
  stats?: {
    afterBytes: number;
    polygons?: number;
    textures?: number;
    unusedRemoved?: number;
  };
}

const DEFAULT_SETTINGS: OptimizeSettings = {
  pruneDedup: true,
  textureMaxSize: 1024, // recommended default
  perTexture: false,
  textureOverrides: {},
  reduce: { enabled: false, ratio: 0.5 },
};

interface OptimizeState {
  settings: OptimizeSettings;
  status: OptimizeStatus;
  estimate: OptimizeEstimate | null;
  result: OptimizeResult | null;
  setSettings: (patch: Partial<OptimizeSettings>) => void;
  /** Set (or, with `null`, clear back to "変更なし") one texture's target edge. */
  setTextureOverride: (name: string, target: number | null) => void;
  setStatus: (status: OptimizeStatus) => void;
  setEstimate: (estimate: OptimizeEstimate | null) => void;
  setResult: (result: OptimizeResult | null) => void;
  /** Non-destructive reset: drop settings/estimate/result back to defaults. */
  reset: () => void;
}

export const useOptimizeStore = create<OptimizeState>()(
  devtools(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      status: "idle",
      estimate: null,
      result: null,
      setSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } }), false, "setSettings"),
      setTextureOverride: (name, target) =>
        set(
          (state) => {
            const textureOverrides = { ...state.settings.textureOverrides };
            if (target == null) {
              delete textureOverrides[name];
            } else {
              textureOverrides[name] = target;
            }
            return { settings: { ...state.settings, textureOverrides } };
          },
          false,
          "setTextureOverride"
        ),
      setStatus: (status) => set({ status }, false, "setStatus"),
      setEstimate: (estimate) => set({ estimate }, false, "setEstimate"),
      setResult: (result) => set({ result }, false, "setResult"),
      reset: () =>
        set(
          { settings: DEFAULT_SETTINGS, status: "idle", estimate: null, result: null },
          false,
          "reset"
        ),
    }),
    { name: "optimizeStore" }
  )
);
