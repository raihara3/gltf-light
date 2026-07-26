import { sendGAEvent } from "@next/third-parties/google";

/**
 * GA4 custom events for v2 (client-side only). Access counts use the automatic
 * `page_view` event (wired via the root `<GoogleAnalytics>` tag); these are the
 * interaction events. All params are anonymous — never the model's bytes,
 * content, or filename. No-op unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type Params = Record<string, string | number | boolean>;

function track(event: string, params?: Params): void {
  if (!GA_ID || typeof window === "undefined") {
    return;
  }
  sendGAEvent("event", event, params ?? {});
}

/** Params for `model_export`, captured from the settings at save time. */
export interface ModelExportParams {
  reduction_pct: number;
  before_mb: number;
  after_mb: number;
  prune_dedup: boolean;
  texture_optimize: boolean;
  texture_per_texture: boolean;
  polygon_reduce: boolean;
  texture_delete_count: number;
}

export const analytics = {
  modelUpload: (method: "click" | "drop", fileSizeMb: number) =>
    track("model_upload", { method, file_size_mb: fileSizeMb }),
  optimizeTabOpen: () => track("optimize_tab_open"),
  optimizeCtaClick: (location: "preview_summary" | "material_tab") =>
    track("optimize_cta_click", { location }),
  modelExport: (params: ModelExportParams) => track("model_export", { ...params }),
};
