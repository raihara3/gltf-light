"use client";

import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { formatFileSize } from "../../lib/formatFileSize";
import { analytics } from "../../lib/analytics";
import { DownloadIcon } from "../../icons";

const bytesToMb = (bytes: number) => +(bytes / 1024 / 1024).toFixed(2);
import styles from "./BeforeAfterSummary.module.scss";

/** Turn "test2.glb" into "test2_optimized.glb". */
function optimizedName(name: string): string {
  const base = name.replace(/\.glb$/i, "");
  return `${base || "model"}_optimized.glb`;
}

/**
 * Fixed bar at the bottom of the optimize sidebar (Figma save-box): the
 * auto-estimated reduction, a reset, and the "軽量化して保存" CTA that downloads
 * the optimized bytes.
 */
export function BeforeAfterSummary() {
  const name = useModelStore((state) => state.meta?.name ?? "model.glb");
  const originalSize = useModelStore((state) => state.meta?.size ?? 0);
  const status = useOptimizeStore((state) => state.status);
  const estimate = useOptimizeStore((state) => state.estimate);
  const resultBytes = useOptimizeStore((state) => state.result?.bytes);
  const settings = useOptimizeStore((state) => state.settings);

  const ready = status === "ready" && estimate != null;

  const handleSave = () => {
    if (!resultBytes) {
      return;
    }
    const blob = new Blob([resultBytes], { type: "model/gltf-binary" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = optimizedName(name);
    link.click();
    URL.revokeObjectURL(url);

    // Capture the export: reduction achieved + which settings were enabled.
    analytics.modelExport({
      reduction_pct: estimate?.deltaPct ?? 0,
      before_mb: bytesToMb(originalSize),
      after_mb: bytesToMb(estimate?.afterBytes ?? 0),
      prune_dedup: settings.pruneDedup,
      texture_optimize: settings.textureMaxSize !== "off",
      texture_per_texture: settings.perTexture,
      polygon_reduce: settings.reduce.enabled,
      texture_delete_count: settings.deletedTextures.length,
    });
  };

  return (
    <div className={styles.bar}>
      <div className={styles.size}>
        {ready ? (
          <>
            <span className={styles.delta}>
              {estimate.deltaPct > 0 ? `-${estimate.deltaPct}%` : "0%"}
            </span>
            <span className={styles.sizes}>
              {formatFileSize(originalSize)} → {formatFileSize(estimate.afterBytes)}
            </span>
          </>
        ) : (
          <span className={styles.placeholder}>
            <span className={styles.spinner} aria-hidden="true" />
            計算中…
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.save} onClick={handleSave} disabled={!ready || !resultBytes}>
          <DownloadIcon size={16} />
          軽量化して保存
        </button>
      </div>
    </div>
  );
}
