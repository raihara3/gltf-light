"use client";

import { useModelStore } from "../../store/modelStore";
import { useOptimizeStore } from "../../store/optimizeStore";
import { formatFileSize } from "../../lib/formatFileSize";
import styles from "./BeforeAfterSummary.module.scss";

/**
 * Fixed summary bar at the bottom of the optimize sidebar (Figma save-box).
 * Shows the auto-estimated size reduction; a placeholder while estimating.
 * The save CTA is added in #37.
 */
export function BeforeAfterSummary() {
  const originalSize = useModelStore((state) => state.meta?.size ?? 0);
  const status = useOptimizeStore((state) => state.status);
  const estimate = useOptimizeStore((state) => state.estimate);

  const ready = status === "ready" && estimate != null;

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
    </div>
  );
}
