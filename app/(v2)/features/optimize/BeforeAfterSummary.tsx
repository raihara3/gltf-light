"use client";

import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { formatFileSize } from "../../lib/formatFileSize";
import { DownloadIcon } from "../../icons";
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
